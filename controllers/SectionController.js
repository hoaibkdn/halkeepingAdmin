const AWS = require('aws-sdk');
const fs = require('fs');
const multiparty = require('multiparty')
const ID = 'AKIATB3XFCKT53CSXUH5';
const SECRET = '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';
const db = require("../db")
// The name of the bucket that you have created
const BUCKET_NAME = 'halgroup';

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET
});

const bucketParams = {
  Bucket: BUCKET_NAME,
};

const addDataSection = async (req, res) => {
  let form = new multiparty.Form();

  let convertedData = {}
  let s3Params = []
  let isUploadingError = false
  
  form.parse(req, function(err, fields, files) {
    console.log('ERORR',err);
    console.log('fields ===> ', fields);
    console.log('file ===> ', files);

    Object.keys(fields).forEach(function(name) {
      console.log('got field named ' + name);
      convertedData[name] = fields[name] ? fields[name][0] : '';
    });
    
    Object.values(files).forEach(function(fileArr) {
      console.log('fileArr ===> ', fileArr);
      const file = fileArr[0]
      const fileName = file.path
      const fileContent = fs.readFileSync(fileName)
      s3Params.push({
        Bucket: BUCKET_NAME,
        Key: file.originalFilename, // File name you want to save as in S3
        Body: fileContent,
        ACL: 'public-read',
      })
    })
    console.log('s3Params @@@ ==> ', s3Params);
    const getUploadPromise = function(param) {
      return s3.upload(param, function(err, data) {
        if (err) {
            isUploadingError= true
        }
        console.log(`File uploaded successfully. ${data.Location}`); // data.Location = https://halgroup.s3.amazonaws.com/
      }).promise();
    }
    // Upload images to S3
    Promise.all(s3Params.map(getUploadPromise)).then((values) => {
      console.log('values ---- ', values);
      values.forEach((item, index) => {
        if(convertedData.images) {
          convertedData.images[index] = item.Location 
        }
        else {
          convertedData = {
            ...convertedData,
            images: {
              [index]: item.Location 
            } 
          }
        } 
      })
      // Save data to db
      console.log("convertedData ====2222 ", convertedData);
      if(String(convertedData) === '{}') {
        res.send({
          data: {
            error: 1,
            message: 'Data should not be empty'
          }
        }) 
        return;
      }
      if(isUploadingError) {
        res.send({
          data: {
            error: 1,
            message: 'Upload images errors'
          }
        }) 
      } 
      else if(String(convertedData) !== '{}') {
        try {
          db.get()
          .collection("section")
          .insertOne(convertedData)
          .then(() => {
            res.send({
              data: {
                error: 0,
                message: "Added successfully",
                section: convertedData
              },
            });
          });
        } catch (error) {
          res.send({
            error: 1,
            message: error.message,
          });
          console.log(error);
        }
      }
    })
  })
};

const getDataSection = (req, res) => {
  db.get()
    .collection("section")
    .findOne({
      section: req.params.sectionName
    }, function(err, section) {
      if (err) {
        res.send({
          data: {
            error: 1,
            message: 'Get section error',
          }
        }); 
        return;
      } 
      return res.send({
        data: {
          error: 0,
          section
        }
      })
    })
}


module.exports = {
  addDataSection,
  getDataSection
};
  