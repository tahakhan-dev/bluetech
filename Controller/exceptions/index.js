const db = require("../../Model");
const Logs = db.exceptionModel;
const MailFunction = require("../../Mail/Nodemailer");
const config = require("config");
const moment = require("moment");
class exceptionController {
  create = async (req, res) => {
    try {
      let { userId, DeviceType, errorMessage } = req.body;
      let schema = {
        userId: userId,
        DeviceType: DeviceType,
        errorMessage: errorMessage,
      };

      const mailOptions = {
        // from: config.get("Email_env.email"),
        from: "giveesapp@gmail.com",
        to: "saadbandukada@gmail.com",
        subject: "App Crashed Exception",
        html: `
                <div style="text-align: center;">
		<div>
			<div>
				<h3 style="font-family: 'Cabin', sans-serif;
				position: relative;
				font-size: 25px;
				font-weight: 700;
				text-transform: uppercase;
				color: #262626;
				margin: 0px;
				letter-spacing: 3px;
				padding-left: 6px;">Oops! App Has Been Crashed</h3>
				<h1 style="font-family: 'Montserrat', sans-serif;
				left: 50%;
				top: 50%;
				font-size: 100px;
				font-weight: 900;
				margin: 0px;
				color: #262626;
				text-transform: uppercase;
				letter-spacing: -10px;
				">Error <span>5</span><span>0</span><span>0</span></h1>
			</div>
			<h2 style="font-family: 'Montserrat', sans-serif;
			left: 50%;
			top: 50%;
			font-size: 20px;
			font-weight: 200;
			margin: 0px;
			color: #262626;
			text-transform: uppercase;">
			Time : ${moment().format("DD/MM/YYYY hh:ss")}
			<br>
			Error Message : ${schema.errorMessage}
			<br>
			User id : ${schema.userId}
			<br>
			Device Type : ${schema.DeviceType}
		</h2>
		</div>
	</div>
                `,
      };

      let sendMail = await MailFunction.sendMail(mailOptions);
      if (sendMail) {
        let logs = await Logs.create(schema);
        if (logs) {
          res.status(200).send({
            success: true,
            Exception: {
              userid: logs.userId,
              deviceType: logs.DeviceType,
              errorLog: logs.errorMessage,
            },
          });
        }
      }
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };
}

module.exports = new exceptionController();
