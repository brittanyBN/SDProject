const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const AWS = require("aws-sdk");
const s3 = new AWS.S3()
const { requiresAuth } = require('express-openid-connect');

/* GET pictures. */
router.get('/', requiresAuth(), async function(req, res, next) {
  let params = {
    Bucket: process.env.CYCLIC_BUCKET_NAME,
    Delimiter: '/',
    Prefix: req.oidc.user.email + '/'
  };
  let allObjects = await s3.listObjects(params).promise();
  let keys = allObjects?.Contents.map( x=> x.Key)
  const pictures = await Promise.all(keys.map(async (key) => {
    let my_file = await s3.getObject({
      Bucket: process.env.CYCLIC_BUCKET_NAME,
      Key: key,
    }).promise();
    return {
      src: Buffer.from(my_file.Body).toString('base64'),
      name: key.split("/").pop()
    }
  }))
  res.render('pictures', { pictures: pictures});
});

/* GET picture. */
router.get('/:picture', async function (req, res, next) {
  let params = {
    Bucket: process.env.CYCLIC_BUCKET_NAME,
    Delimiter: '/',
    Prefix: 'public/'
  };
  let allObjects = await s3.listObjects(params).promise();
  let keys = allObjects?.Contents.map(x => x.Key)
  let picture = req.params.picture;
  picture += '.JPG';
  res.sendFile(path.join(__dirname, '../pictures/', picture));
});

/* POST picture. */
router.post('/', requiresAuth(), async function(req, res, next) {
  const file = req.files.file;
  console.log(req.files);
  await s3.putObject({
    Body: file.data,
    Bucket: process.env.CYCLIC_BUCKET_NAME,
    Key: req.oidc.user.email + "/" + file.name,
  }).promise()
  res.end();
});

module.exports = router;
