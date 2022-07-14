const Winston = require("winston");
module.exports = function (err, req, res, next) {
  Winston.error(err.message, err);
  res.render("error/500.ejs", { error: `ERROR: ${err.message}` });
};
