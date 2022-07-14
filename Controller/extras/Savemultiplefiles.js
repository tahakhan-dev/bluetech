const path=require('path');
const multer=require('multer');



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname+ '/../../Files'))
      //cb(null, (`/home/squarepro/public_html/SupportImages`))
      
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname) //Appending .jpg
      return this.filename
    },
    fileFilter: function (req, file, callback) {
      var ext = path.extname(file.originalname);
      if(ext !== '.png' || ext !== '.jpg' || ext !== '.gif' || ext !== '.jpeg' || ext!=='.docx' || ext!=='.pdf') {
          return callback(new Error('invalid file format'))
      }
      callback(null, true)
  },
   
    
  })
  const upload = multer({ storage: storage })
  module.exports = upload