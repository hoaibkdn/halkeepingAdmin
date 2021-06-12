const AWS = require("aws-sdk");
const nodemailer = require("nodemailer");
const sharp = require("sharp");
const multiparty = require("multiparty");

const utils = require("./../utils");
const ObjectId = require("mongodb").ObjectID;
const ID = "AKIATB3XFCKT53CSXUH5";
const SECRET = "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";
const db = require("../db");
// The name of the bucket that you have created
const BUCKET_NAME = "halgroup";
const REGEX_NUM = /\d+/g;

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
});

const bucketParams = {
  Bucket: BUCKET_NAME,
};

const resizeImages = async (file, filename) => {
  return await sharp(file).toFormat("jpeg").jpeg({ quality: 40 }).toBuffer();
};

const isAddableSction = async (section) => {
  const item = await db
    .get()
    .collection("section")
    .findOne({
      $or: [
        {
          section,
        },
      ],
    });
  if (item) {
    return false;
  }
  return true;
};

function convertDataSection(fields) {
  let convertedData = {
    section: "",
    title: "",
    description: "",
    images: [],
    data: [],
    videos: [],
  };

  const fieldsArr = Object.keys(fields);
  for (let i = 0; i < fieldsArr.length; i++) {
    const name = fieldsArr[i];
    if (name === "section") {
      convertedData.section = fields[name][0]; // set the mapping origin and section name;
    }

    // TODO: REFACTOR the way to convert data
    const numbers = name.match(REGEX_NUM) || [];
    // title, description, section, video
    if (numbers.length < 1 && name !== "section") {
      convertedData[name] = fields[name] ? fields[name][0] : "";
    }
    // title_1, description_1, video_1, image_1, image_2
    const label = name.split("_")[0];
    if (numbers.length === 1) {
      const index = Number(name.split("_")[1]);
      if (label === "image") {
        convertedData.images.push(fields[name] ? fields[name][0] : "");
        continue;
      }
      if (convertedData.data[index - 1]) {
        convertedData.data[index - 1] = {
          ...convertedData.data[index - 1],
          [label]: fields[name] ? fields[name][0] : "",
        };
      } else {
        convertedData.data.push({
          [label]: fields[name] ? fields[name][0] : "",
          images: [],
        });
      }
    } else if (numbers.length === 2 && label === "image") {
      const index = Number(name.split("_")[2]);
      if (
        convertedData.data[index - 1] &&
        convertedData.data[index - 1].images
      ) {
        convertedData.data[index - 1].images.push(
          fields[name] ? fields[name][0] : ""
        );
      } else {
        convertedData.data[index - 1] = {
          ...convertedData.data[index - 1],
          images: [fields[name] ? fields[name][0] : ""],
        };
      }
    }
  }
  return convertedData;
}

async function parseParamsS3(files) {
  let s3Params = { 0: [] };
  const filesUpload = Object.values(files);
  for (let i = 0; i < filesUpload.length; i++) {
    const file = filesUpload[i] ? filesUpload[i][0] : null;
    if (!file) {
      continue;
    }
    const numbers = file.fieldName.match(REGEX_NUM) || [];
    const fileName = file.path;
    const fileContent = await resizeImages(fileName, file.originalFilename);
    const param = {
      Bucket: BUCKET_NAME,
      Key: file.originalFilename, // File name you want to save as in S3
      Body: fileContent,
      ACL: "public-read",
    };
    // image_1, image_2 => common in the section, put at 0
    if (numbers.length === 1) {
      s3Params[0] = s3Params[0].concat(param);
    } else {
      // image_1_1, image_1_2 for each content
      if (s3Params[numbers[0]]) {
        s3Params[numbers[0]].push(param);
      } else {
        s3Params = {
          ...s3Params,
          [numbers[0]]: [param],
        };
      }
    }
  }
  return s3Params;
}

const getUploadPromise = function (param, errorUploading) {
  return s3
    .upload(param, function (err, data) {
      if (err) {
        errorUploading.isUploadingError = true;
      }
      console.log(`File uploaded successfully. ${data.Location}`); // data.Location = https://halgroup.s3.amazonaws.com/
    })
    .promise();
};

// {
//   Section: 3,
//   Title: ‘’,
//   images: [‘url’]
//   data: [
//     {
//         Title: ‘Family’,
//         Description: [123123123],
//  images: [‘’url1, url2]
//     },
//    {
//         Title: ‘Family’,
//         Description: [123123123],
//  images: [‘’url1, url2]
//     }]
// }
const checkDataSection = async (req, res, isAddNewSection) => {
  let sectionName = req.params.sectionName || "";
  let form = new multiparty.Form();

  let convertedData = {
    section: 0,
    title: "",
    description: "",
    images: [],
    data: [],
  };

  // let s3Params = []
  let s3Params = { 0: [] };
  let errorUploading = {
    isUploadingError: false,
  };
  form.parse(req, async function (err, fields, files) {
    if (fields) {
      convertedData = convertDataSection(fields);
      sectionName = convertedData.section;

      // Check isAddableSction
      const isAddableSec = await isAddableSction(sectionName);

      if (isAddNewSection && !isAddableSec) {
        res.send({
          data: {
            error: 1,
            message: "Your section name has used, please use another name",
          },
        });
        return;
      }
    }

    // Files
    if (JSON.stringify(files) !== "{}") {
      s3Params = await parseParamsS3(files);
    } else {
      insertSectionToDb(sectionName, convertedData, res);
      return;
    }

    // { 0: [param, param], 1: [param, param]}
    // Upload images to S3
    const s3ParamsArray = utils.mergeS3Parram(s3Params);
    Promise.all(
      s3ParamsArray.map((item) => getUploadPromise(item, errorUploading))
    ).then((values) => {
      utils.mapS3ImageToConvertedData(values, s3Params, convertedData);

      // Save data to db
      if (String(convertedData) === "{}") {
        res.send({
          data: {
            error: 1,
            message: "Data should not be empty",
          },
        });
        return;
      }
      if (errorUploading.isUploadingError) {
        res.send({
          data: {
            error: 1,
            message: "Upload images errors",
          },
        });
      } else if (String(convertedData) !== "{}") {
        insertSectionToDb(sectionName, convertedData, res);
      }
    });
  });
};

const getDataSection = (req, res) => {
  db.get()
    .collection("section")
    .findOne(
      {
        section: req.params.sectionName,
      },
      function (err, section) {
        if (err) {
          res.send({
            data: {
              error: 1,
              message: "Get section error",
            },
          });
          return;
        }
        return res.send({
          data: {
            error: 0,
            section,
          },
        });
      }
    );
};

const getBatchOfSections = (req, res) => {
  const sectionParams = req.params.sections;
  const arraySectionNames = sectionParams ? sectionParams.split(",") : [];
  if (!arraySectionNames.length) {
    res.send({
      data: {
        error: 1,
        message: "Your sections are not correct foramat",
      },
    });
    return;
  }
  const sectionQuery = arraySectionNames.reduce((result, name) => {
    result.push({
      section: name,
    });
    return result;
  }, []);
  db.get()
    .collection("section")
    .find({
      $or: sectionQuery,
    })
    .toArray(function (err, section) {
      if (err) {
        res.send({
          data: {
            error: 1,
            message: "Get section error",
          },
        });
        return;
      }
      return res.send({
        data: {
          error: 0,
          section,
        },
      });
    });
};

const insertSectionToDb = (sectionName, convertedData, res) => {
  const insertSection = () => {
    db.get()
      .collection("section")
      .insertOne(convertedData)
      .then(() => {
        res.send({
          data: {
            error: 0,
            message: "Added successfully",
            section: convertedData,
          },
        });
      });
  };
  if (!sectionName) {
    return insertSection();
  }
  try {
    db.get()
      .collection("section")
      .findOne(
        {
          section: sectionName,
        },
        async function (err, section) {
          if (!section) {
            // create new section
            insertSection();
          } else {
            const result = await db.get().collection("section").updateOne(
              {
                section: sectionName,
              },
              {
                $set: convertedData,
              },
              { upsert: true }
            );
            if (result.matchedCount === 1) {
              res.send({
                data: {
                  error: 0,
                  message: "Updated successfully",
                  section: convertedData,
                },
              });
              return;
            }
            res.send({
              data: {
                error: 1,
                message: "There is an error occur",
              },
            });
          }
        }
      );
  } catch (error) {
    res.send({
      error: 1,
      message: error.message,
    });
    console.log(error);
  }
};

async function addDataSection(req, res) {
  checkDataSection(req, res, true);
}

async function updateSection(req, res) {
  checkDataSection(req, res, false);
}

async function removeSection(req, res) {
  const sectionName = req.params.sectionName;
  if (sectionName) {
    await db
      .get()
      .collection("section")
      .deleteOne({ section: sectionName }, true);
    res.send({
      data: {
        error: 0,
        message: "Delete successfully",
      },
    });
    return;
  }
  res.send({
    data: {
      error: 1,
      message: "No section name",
    },
  });
}

// Send email structure
//{
// 	"email": "halStorm13@gmail.com",
// 	"subject": "Test sending email",
// 	"body": "I wanna test sending email"
// }

function sendEmail(req, res) {
  const { email: senderEmail, subject, body } = req.body;
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "hoaibkdn2012@gmail.com",
      pass: "UtCung@13",
    },
  });

  var mailOptions = {
    from: senderEmail,
    to: "hoaibkdn2012@gmail.com",
    subject: subject,
    text: body,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.send({
        data: {
          error: 1,
          message: error,
        },
      });
    } else {
      res.send({
        data: {
          error: 0,
          message: "Sent email successfully",
        },
      });
    }
  });
}

module.exports = {
  addDataSection,
  updateSection,
  getDataSection,
  removeSection,
  sendEmail,
  checkDataSection,
  getBatchOfSections,
  convertDataSection,
  parseParamsS3,
  getUploadPromise,
};
