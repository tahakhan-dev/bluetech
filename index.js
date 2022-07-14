"use strict";

global.ROOTPATH = __dirname;

const express = require("express");
const moment = require("moment");
const cors = require("cors");
const http = require("http");
const path = require("path");
const cron = require("node-cron");
const fs = require("fs");
const bodyParser = require('body-parser');
const slowDown = require("express-slow-down");
const RateLimit = require("express-rate-limit");
const { Request, Response } = require("express-rate-limit");

const app = express();

const { connect_cache } = require("./cache/redis.service");
const handle = require("./Middleware/error");
const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger.json");
const { default_settings } = require("./user_default_settings");

const paypal = require("paypal-rest-sdk");

const PORT = process.env.PORT;

const server = http.createServer(app);

app.use(cors());

app.use(bodyParser.json({limit:'50mb'})); 
app.use(bodyParser.urlencoded({extended:true, limit:'50mb'})); 

app.use("/uploads", express.static("uploads"));



app.use(express.static(__dirname + "views"));

app.use(express.static("public"));

// Rate limiter
// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)

app.set("trust proxy", 1);

// Storing in memCache
const slD = new slowDown({
  windowMs: 5 * 60 * 1000, //how long to keep records of requests in memory.
  delayAfter: 100,
  delayMs: 500, // begin adding 500ms of delay per request above 100:
});

const rtL = RateLimit({
  max: 150,
  prefix: "rateLimit",
  skipFailedRequests: false, // Do not count failed requests (status >= 400)
  skipSuccessfulRequests: false, // Do not count successful requests (status < 400)
  windowMs: 3 * 60 * 1000,
  expiry: 300,
  resetExpiryOnChange: true,
  message: {
    success: false,
    message: "Too many API hits from this IP, please try again after 3 minute",
  },
});

app.set("view engine", "ejs");

paypal.configure({
  mode: "sandbox", //sandbox or live

  client_id:
    "AY0GIMq4_c_6UVx-J0k6AI1Za6k_hbJF3A997Uxh2y6stZILGoYBEwbMwYWMAdrZ3hc3M7U21ssZJMZa",
  client_secret:
    "EAlxjNDzX2DYGgFkm2sdA8nV6jVTsUeFnbcu8-2e5l6WoHPv0dBIuvPyxvkuHounQvdaFKUwgJGY5AyA",
});

const db = require("./Model");
const fcm = require("./FCMNotification/fcmnotificatins");

db.sequelize
  .sync({
    force: false, // To create table if exists , so make it false
  })
  .then(async () => {
    console.info(`✔️ Database Connected`);
    connect_cache()
      .then(() => {
        console.info("✔️ Redis Cache Connected");
        /**
         * Listen on provided port, on all network interfaces.
         */
        server.listen(PORT, async function () {
          console.log(PORT, "PORTPORTPORTPORT");
          console.info(`✔️ Server Started (listening on PORT : ${PORT})`);
          if (process.env.NODE_ENV) {
            console.info(`✔️ (${process.env.NODE_ENV}) ENV Loaded`);
          }
          console.info(`⌚`, moment().format("DD-MM-YYYY hh:mm:ss a"));
          default_settings()
            .then(() => {
              console.log(`✔️ Default Data Set`);
            })
            .catch((e) => {
              if (e) {
                console.error("❗️ Could not execute properly", e);
              }
              console.log(`✔️ Default Data Exists`);
            });
        });
      })
      .catch((err) => {
        console.error(`❌ Server Stopped (listening on PORT : ${PORT})`);
        console.info(`⌚ `, moment().format("DD-MM-YYYY hh:mm:ss a"));
        console.error("❗️ Could not connect to redis database...", err);
        process.exit();
      });

    /**
     * Normalize a port into a number, string, or false.
     */
    function normalizePort(val) {
      var port = parseInt(val, 10);
      if (isNaN(port)) {
        return val;
      }
      if (port >= 0) {
        return port;
      }
      return false;
    }

    /**
     * Event listener for HTTP server "error" event.
     */
    function terminate(server, options = { coredump: false, timeout: 500 }) {
      // Exit function
      const exit = (code) => {
        options.coredump ? process.abort() : process.exit(code);
      };

      return (code, reason) => (err, promise) => {
        if (err && err instanceof Error) {
          // Log error information, use a proper logging library here :)
          fs.appendFileSync("access.log", err.message);
          console.log(err.message, err.stack);
        }

        // Attempt a graceful shutdown
        // server.close(exit);
        // setTimeout(exit, options.timeout).unref();
      };
    }

    function exitHandler(options, exitCode) {
      terminate(server, {
        coredump: false,
        timeout: 500,
      });
      console.log("⚠️ Gracefully shutting down");
      server.close();
      process.exit();
    }

    process.on("uncaughtException", (err) => {
      fs.appendFile(
        "access.log",
        `Uncaught Exception: ${err.message}`,
        () => {}
      );
      console.log(`Uncaught Exception: ${err.message}`);
    });
    process.on("unhandledRejection", (reason, promise) => {
      fs.appendFile(
        "access.log",
        `Unhandled rejection, reason: ${reason}`,
        () => {}
      );
      console.log("Unhandled rejection at", promise, `reason: ${reason}`);
    });
    process.on("SIGINT", exitHandler.bind(null, { exit: true }));

    // catches "kill pid" (for example: nodemon restart)
    process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
    process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));
  })
  .catch((err) => {
    console.error(`❌ Server Stopped (listening on PORT : ${PORT})`);
    console.info(`⌚`, moment().format("DD-MM-YYYY hh:mm:ss a"));
    console.error("❗️ Could not connect to database...", err);
    process.exit();
  });

// check for expiry voucher and campaign at every 6th hour
cron.schedule("0 0 */6 * * * ", async () => {
  await db.campaign.update(
    { isActive: 0, pending: 0, isExpired: 1 },
    {
      where: {
        campaignExpiresAt: {
          [db.Sequelize.Op.lte]: moment(Date.now())
            .tz("Asia/Karachi")
            .format("YYYY-MM-DDTHH:mm:ss"),
        },
      },
    }
  );
  // let ExpireVoucher = await db.VoucherGen.findAll({
  //   include: [
  //     {
  //       model: db.users,
  //     },
  //     {
  //       model: db.product,
  //     },
  //   ],
  //   where: {
  //     isActive: 1,
  //     expiresAt: {
  //       [db.Sequelize.Op.lte]: moment(Date.now())
  //         .tz("Asia/Karachi")
  //         .format("YYYY-MM-DDTHH:mm:ss"),
  //     },
  //   },
  // });

  // if (ExpireVoucher) {
  //   // ExpireVoucher.map((element) => {
  //   //   var message = {
  //   //     to: element.user.fcmtoken,
  //   //     notification: {
  //   //       title: "Voucher Alert",
  //   //       body: `Your ${element.product.name} has been Expired`,
  //   //     },
  //   //   };
  //   //   // fcm.send(message, async function (err, response) {
  //   //   //   if (err) {
  //   //   //     await db.notification.create({
  //   //   //       senderId: element.userId,
  //   //   //       receiverId: element.userId,
  //   //   //       voucherId: element.productId,
  //   //   //       Body: `Your ${element.product.name} has been Expired`,
  //   //   //       Title: "Expired",
  //   //   //       RouteId: 16,
  //   //   //       IsAction: 0,
  //   //   //       IsCount: 1,
  //   //   //     });
  //   //   //   } else {
  //   //   //     await db.notification.create({
  //   //   //       senderId: element.userId,
  //   //   //       receiverId: element.userId,
  //   //   //       voucherId: element.productId,
  //   //   //       Body: `Your ${element.product.name} has been Expired`,
  //   //   //       Title: "Expired",
  //   //   //       RouteId: 16,
  //   //   //       IsAction: 0,
  //   //   //       IsCount: 1,
  //   //   //     });
  //   //   //   }
  //   //   // });
  //   // });
  // }
  await db.VoucherGen.update(
    { isActive: 0, isExpired: 1 },
    {
      where: {
        expiresAt: {
          [db.Sequelize.Op.lte]: moment(Date.now())
            .tz("Asia/Karachi")
            .format("YYYY-MM-DDTHH:mm:ss"),
        },
      },
    }
  );
});

app.use("/api", slD, rtL, require("./Startup/api"));
app.use("/cache", slD, rtL, require("./cache"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/", slD, rtL, require("./Startup/web"));

// app.get('/www', (req, res) => res.sendFile(__dirname + "/index.html"));

require("./SocketIo/Socket")(server);

// Swagger Routes

// Exceptions Handling
// Calling Error Handling Middleware
app.use(handle);
require("./Startup/exceptions")();

app.use(express.static(path.join(__dirname, "public")));

module.exports = server;
