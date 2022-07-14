const config = require("config");
if (process.env.NODE_ENV == "development") {
  let configurations = {
    HOST: config.get("dbConfig.host"),
    USER: config.get("dbConfig.USER"),
    PASSWORD: config.get("dbConfig.PASSWORD"),
    DB: config.get("dbConfig.DB"),
    dialect: "mysql",
    pool: {
      max: 100,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  };
  module.exports = configurations;
} else if (process.env.NODE_ENV == "production") {
  let configurations = {
    HOST: config.get("dbConfig.host"),
    USER: config.get("dbConfig.USER"),
    PASSWORD: config.get("dbConfig.PASSWORD"),
    DB: config.get("dbConfig.DB"),
    dialect: "mysql",
    pool: {
      max: 100,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  };
  module.exports = configurations;
}
