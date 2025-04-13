var express = require('express');
var router = express.Router();
let multer = require('multer');
let path = require('path');

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'cdn-server/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

let upload = multer({ storage: storage });

router.post('/', upload.single('file'), function (req, res) {
  if (!req.file) return res.status(400).send({ success: false, message: 'No file uploaded.' });
  res.status(200).send({ success: true, filename: req.file.filename });
});

module.exports = router;