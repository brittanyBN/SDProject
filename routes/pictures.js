const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

/* GET pictures listing. */
router.get('/', function(req, res, next) {
  const pictures = fs.readdirSync(path.join(__dirname, '../pictures/'));
  res.render('pictures', { pictures: pictures});
});

/* GET picture. */
router.get('/:picture', function(req, res, next) {
  let picture = req.params.picture;
  picture += '.JPG';
    res.sendFile(path.join(__dirname, '../pictures/', picture));
});

router.post('/', function(req, res, next) {
  const file = req.files.file;
  fs.writeFileSync(path.join(__dirname, '../pictures/', file.name), file.data);
  res.end();
});

module.exports = router;
