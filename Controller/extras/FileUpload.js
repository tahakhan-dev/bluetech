const multer = require("multer");
const fs = require("fs");

let fileUpload = (condition) => {
  const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
      const dir = "./uploads/";
      fs.mkdirSync(dir, { recursive: true });
      return cb(null, dir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname);
    },
  });

  const fileFilter = (req, file, cb) => {
    const picCond =
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg";
    const vidCond = file.mimetype == "video/mp4";
    let permission = null;
    if (condition == "video") {
      permission = vidCond;
    } else if (condition == "image") {
      permission = picCond;
    }
    if (permission) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

  const upload = multer({ storage: storage, fileFilter: fileFilter });
  return upload;
};

module.exports = fileUpload;
