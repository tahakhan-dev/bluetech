const moment = require("moment");
let isExpired = false;

exports.StartingCheck = function (requestdate) {
  let d2 = moment().format();
  let moments = moment(requestdate).isAfter(d2);
  if (moments) {
    return (isExpired = true);
  } else {
    return (isExpired = false);
  }
};

exports.ExpireyCheck = function (requestdate) {
  let d2 = moment().format();
  let moments = moment(requestdate).isAfter(d2);
  if (moments) {
    return (isExpired = true);
  } else {
    return (isExpired = false);
  }
};
