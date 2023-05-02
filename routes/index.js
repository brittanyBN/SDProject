const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const AWS = require("aws-sdk");
const s3 = new AWS.S3()

/* GET home page. */
router.get('/', async function(req, res, next) {
  let params = {
    Bucket: process.env.CYCLIC_BUCKET_NAME,
    Delimiter: '/',
    Prefix: 'public/'
  };
  let allObjects = await s3.listObjects(params).promise();
  let keys = allObjects?.Contents.map( x=> x.Key).slice(0,3);
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
  res.render('index', { pictures: pictures, title: 'Express' });
});

module.exports = router;
