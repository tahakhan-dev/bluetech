const fs = require("fs");
const path = require("path");

exports.saveFile = function (dir, file, callback) {
  var filename = Date.now();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true }, (err) => {
      if (err) throw err;
    });
  }
  let filePath = path.join(dir, filename + "." + file.mimetype.split("/")[1]);
  fs.writeFileSync(filePath, file.buffer);
  return callback(filePath);
};
