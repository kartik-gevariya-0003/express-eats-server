// Author: Tasneem Yusuf Porbanderwala
const multer = require("multer");
var path = require("path");
var appDir = path.dirname(require.main.filename);
const fs = require("fs");
console.log("before creation");
const dir = "./temp/";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}
var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, appDir + "/temp/");
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});

var uploadFile = multer({ storage: storage });
module.exports = uploadFile;
