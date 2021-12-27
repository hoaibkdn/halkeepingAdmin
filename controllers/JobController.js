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

/*
  body:
  {
    name: "string",
    phone: "string",
    email: "a@gmail.com",
    address: "Hai Chau, Da Nang",
    cleaningTool: {
      basic: true,
      vacuum: true,
    },
    preferDate: Date, 
    startWorkingTime: "08:30am",
    durationTime: 150, //2h30m
    note: "asdas asd asd sd",
    unit: "vnd"
  }
*/
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
  const cleaningTool = req.body.cleaningTool;
  const [priceInfo, paymentMethod, cleaningToolFee] = await getBasicFeeDb();
  try {
    db.get()
      .collection("job")
      .insertOne(job)
      .then((createdJob) => {
        const insertedJob = createdJob.ops[0] ? createdJob.ops[0]._doc : job;
        res.send({
          data: {
            error: 0,
            message: "Created the job successfully",
            data: {
              ...insertedJob,
              customer: insertedCustomer,
              priceInfo,
              paymentMethod,
              cleaningToolFee,
              total: calculateTotalFee(
                {
                  durationTime: req.body.durationTime,
                  cleaningTool,
                },
                priceInfo,
                cleaningToolFee
              ),
            },
          },
        });
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

async function getBasicFeeDb() {
  let priceInfo = {
    one_hour: 80000,
    from_two_hour: 60000,
  };
  let paymentMethod = [
    {
      method: "cash",
    },
  ];
  let cleaningToolFee = {
    basic: 30000,
    vacuum: 30000,
  };

  try {
    priceInfo = await db.get().collection("price_per_hour").findOne();
    paymentMethod = await db
      .get()
      .collection("payment_method")
      .find()
      .toArray();
    cleaningToolFee = await db
      .get()
      .collection("price_cleaning_tool")
      .findOne();
  } catch (e) {
    return [priceInfo, paymentMethod, cleaningToolFee];
  }
  return [priceInfo, paymentMethod, cleaningToolFee];
}

/* body: 
  {
    durationTime: 150,
    cleaningTool: {
      basic: true,
      vacuum: false,
    },
    customer: Customer // optional 
  }
  When press confirm, should send both customer info
  Customer: 
  {
    name: "string",
    phone: "string",
    email: "a@gmail.com",
    address: "Hai Chau, Da Nang",
  }
*/
const getBasicJobInfo = async function (req, res) {
  // basic info default
  const [priceInfo, paymentMethod, cleaningToolFee] = await getBasicFeeDb();
  try {
    // Save user info
    if (req.body.customer) {
      await addCustomerPhoneNumber(
        new Customer({
          ...req.body.customer,
        })
      );
    }

    // Calculate total price
    const totalFee = calculateTotalFee(req.body, priceInfo, cleaningToolFee);
    res.send({
      error: 0,
      data: {
        price_per_hour: priceInfo,
        payment_method: paymentMethod,
        cleaning_tool_fee: cleaningToolFee,
        total: totalFee,
      },
    });
    return;
  } catch (e) {
    res.send({
      error: e,
      data: {
        data: {
          price_per_hour: priceInfo,
          payment_method: paymentMethod,
          cleaning_tool_fee: cleaningToolFee,
        },
      },
    });
  }
};

// Calculate total fee
function calculateTotalFee(basicInfoReq, priceInfo, cleaningToolFee) {
  const basicInfo = {
    durationTime: basicInfoReq.durationTime
      ? Number(basicInfoReq.durationTime)
      : 0,
    cleaningTool: {
      basic:
        basicInfoReq.cleaningTool && basicInfoReq.cleaningTool.basic ? 1 : 0,
      vacuum:
        basicInfoReq.cleaningTool && basicInfoReq.cleaningTool.vacuum ? 1 : 0,
    },
  };
  const usingPrice =
    basicInfo.durationTime <= 60 ? priceInfo.one_hour : priceInfo.from_two_hour;
  const pricePerMin = usingPrice / 60;
  const totalCleaningToolFee =
    basicInfo.cleaningTool.basic * cleaningToolFee.basic +
    basicInfo.cleaningTool.vacuum * cleaningToolFee.vacuum;
  const totalFee =
    Math.round(basicInfo.durationTime * pricePerMin) + totalCleaningToolFee;

  return totalFee;
}

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
