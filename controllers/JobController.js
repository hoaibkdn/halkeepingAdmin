const Job = require("./../models/Job");
const Customer = require("./../models/Customer");
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
      { $sort: { updatedAt: -1 } },
      // {
      //   $lookup: {
      //     from: "cleaner",
      //     localField: "cleanerId",
      //     foreignField: "_id",
      //     as: "cleaner",
      //   },
      // },
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

// find existing phone number
const addCustomerPhoneNumber = async function (customerInfo) {
  try {
    const customerRes = await db.get().collection("customer").findOne({
      phone: customerInfo.phone,
    });
    if (!customerRes) {
      await db.get().collection("customer").insertOne(customerInfo);
    }
    return customerRes;
  } catch (error) {
    return null;
  }
};

const createNewJob = async function (req, res, next) {
  const insertedCustomer = await addCustomerPhoneNumber(
    new Customer({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
    })
  );

  const job = new Job({
    ...req.body,
    customerId: insertedCustomer._id,
  });
  try {
    db.get()
      .collection("job")
      .insertOne(job)
      .then((createdJob) => {
        const jobId = createdJob.ops[0]._id;
        res.send({
          data: {
            error: 0,
            message: "Created the job successfully",
          },
        });
        // const jobCleaner = req.body.cleaners
        //   ? req.body.cleaners.map((item) => ({
        //       cleanerId: item,
        //       jobId,
        //     }))
        //   : [];
        //   db.get()
        //     .collection("job_cleaner")
        //     .insertMany(jobCleaner)
        //     .then(() => {
        //       res.send({
        //         data: {
        //           error: 0,
        //           message: "Created the job successfully",
        //         },
        //       });
        //     });
        //   // res.send({
        //   //   data: {
        //   //     error: 0,
        //   //     message: "Created the job successfully",
        //   //   },
        //   // });
      });
  } catch (error) {
    res.send({
      error: 1,
      message: error.message,
    });
  }
};

const editJob = async function (req, res) {
  const editedData = { ...req.body, updatedAt: Date.now() };
  if (editedData.customerId && req.body.customerId) {
    editedData.customerId = new ObjectId(req.body.customerId);
  }
  if (req.body.cleanerId) {
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

const getBasicJobInfo = async function (req, res) {
  try {
    const priceInfo = await db.get().collection("price_per_hour").findOne();
    const paymentMethod = await db.get().collection("payment_method").findOne();
    const cleaningToolFee = await db
      .get()
      .collection("price_cleaning_tool")
      .findOne();
    res.send({
      error: 0,
      data: {
        price_per_hour: priceInfo,
        payment_method: [paymentMethod], // TODO: should get array
        cleaning_tool_fee: cleaningToolFee,
      },
    });
    return;
  } catch (e) {
    res.send({
      error: 0,
      data: {
        price_per_hour: {
          one_hour: 80000,
          from_two_hour: 60000,
        },
        payment_method: {
          method: "",
        },
        cleaning_tool_fee: cleaningToolFee,
      },
    });
  }
};

const initBasicJobInfo = async function (req, res) {
  const user_id = ObjectId(req.user._id);
  const priceInfo = {
    user_id,
    one_hour: 80000,
    from_two_hour: 60000,
  };
  const priceCleaningTool = {
    user_id,
    basic: 30000,
    vacuum: 30000,
  };
  const paymentMethod = {
    method: "cash",
  };
  try {
    await db.get().collection("price_per_hour").insertOne(priceInfo);
    await db
      .get()
      .collection("price_cleaning_tool")
      .insertOne(priceCleaningTool);
    await db.get().collection("payment_method").insertOne(paymentMethod);
    res.send({
      error: 0,
      message: "Init basic info successfully",
    });
  } catch (error) {
    res.send({
      error: 1,
      message: "Cannot insert",
    });
  }
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
  getBasicJobInfo,
  initBasicJobInfo,
};
