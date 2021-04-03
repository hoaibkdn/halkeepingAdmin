const AWS = require('aws-sdk');
const fs = require('fs');
const multiparty = require('multiparty')
const ID = 'AKIATB3XFCKT53CSXUH5';
const SECRET = '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';

// The name of the bucket that you have created
const BUCKET_NAME = 'halgroup';

const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});

const bucketParams = {
    Bucket: BUCKET_NAME,
};

const uploadFile = (req, res) => {
  let form = new multiparty.Form();

  form.parse(req, function(err, fields, files) {
    console.log('fields ===> ', fields);
    console.log('file ===> ', files.file);

    Object.keys(fields).forEach(function(name) {
      console.log('got field named ' + name);
    });
    
    Object.values(files.file).forEach(function(file) {
      console.log('file @@@ ', file);
      const fileName = file.path
      const fileContent = fs.readFileSync(fileName)
      const params = {
        Bucket: BUCKET_NAME,
        Key: 'cat.jpg', // File name you want to save as in S3
        Body: fileContent
      }; 
      // Uploading files to the bucket
      s3.upload(params, function(err, data) {
        if (err) {
            throw err;

        }
        res.send({
          error: 0,
          message: 'Upload successfully'
        })
        console.log(`File uploaded successfully. ${data.Location}`); // data.Location = https://halgroup.s3.amazonaws.com/
      }); 
    })
  })
    // console.log('req ===> ', req);
    // const fileName = req.body.picName
    // // Read content from the file
    // const fileContent = fs.readFileSync(fileName);

    // // Setting up S3 upload parameters
    // const params = {
    //     Bucket: BUCKET_NAME,
    //     Key: 'cat.jpg', // File name you want to save as in S3
    //     Body: fileContent
    // };

    // // Uploading files to the bucket
    // s3.upload(params, function(err, data) {
    //     if (err) {
    //         throw err;
    //     }
    //     console.log(`File uploaded successfully. ${data.Location}`);
    // });
};

const getImages = (req, res) => {
  s3.listObjects(bucketParams, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log(data.Contents,"<<<all content");

      data.Contents.forEach(function(obj,index){
          console.log(obj.Key,"<<<file path")
      })
      res.send({
        data: {
          error: 0,
          images: data
        }
      })
      console.log("Success", data);
    }
    res.send({
      data: {
        error: 1
      }
    })
  });
}


module.exports = {
  uploadFile,
  getImages
};
  