const Job = require("./../models/Job");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./../db");
const puppeteer = require("puppeteer");
var ObjectId = require("mongodb").ObjectID;

const getAllJobs = async function (req, res) {
  db.get()
    .collection("job")
    .aggregate([
      {
        $lookup: {
          from: "customer",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $lookup: {
          from: "cleaner",
          localField: "cleanerId",
          foreignField: "_id",
          as: "cleaner",
        },
      },
    ])
    .toArray()
    .then((jobs) => {
      if (jobs) {
        res.send({
          data: {
            error: 0,
            ...jobs,
          },
        });
        return;
      }
      res.send({
        data: {
          error: 1,
          message: "Get job error",
        },
      });
    });
};

const createNewJob = function (req, res, next) {
  const job = new Job({
    ...req.body,
    customerId: new ObjectId(req.body.customerId),
  });
  delete job.cleanerId;
  try {
    db.get()
      .collection("job")
      .insertOne(job)
      .then((createdJob) => {
        const jobId = createdJob.ops[0]._id;
        console.log("createdJob jobId ==> ", jobId);
        const jobCleaner = req.body.cleaners
          ? req.body.cleaners.map((item) => ({
              cleanerId: item,
              jobId,
            }))
          : [];
        db.get()
          .collection("job_cleaner")
          .insertMany(jobCleaner)
          .then(() => {
            res.send({
              data: {
                error: 0,
                message: "Created the job successfully",
              },
            });
          });
        // res.send({
        //   data: {
        //     error: 0,
        //     message: "Created the job successfully",
        //   },
        // });
      });
  } catch (error) {
    res.send({
      error: 1,
      message: error.message,
    });
    console.log(error);
  }
};

const editJob = async function (req, res) {
  const editedData = { ...req.body, updatedAt: Date.now() };
  if (editedData.customerId) {
    editedData.customerId = new ObjectId(req.body.customerId);
  }
  if (editedData.cleanerId) {
    editedData.cleanerId = new ObjectId(req.body.cleanerId);
  }
  const result = await db
    .get()
    .collection("job")
    .updateOne(
      {
        _id: new ObjectId(req.params.jobId),
      },
      {
        $set: editedData,
      },
      { upsert: true }
    );
  if (result.matchedCount === 1) {
    res.send({
      data: {
        error: 0,
        message: "Updated successfully",
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
};

const downloadPdfBill = async function (req, res) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    "https://blog.risingstack.com/pdf-from-html-node-js-puppeteer/"
  );
  const result = await page.screenshot({ path: "example.png" });
  console.log("result @@@ ", result);
  await browser.close();
  res.send({
    error: 0,
  });
};

module.exports = {
  createNewJob,
  getAllJobs,
  editJob,
  downloadPdfBill,
};
