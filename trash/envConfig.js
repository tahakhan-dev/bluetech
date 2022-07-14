const config = require("config");

module.exports = function () {
  if (!"MYSECUREKEY") {
    throw new Error("FATAL ERROR : JWT Private Key Not Defined");
  }
};
