const Job = require("./../models/Job");
const Customer = require("./../models/Customer");
const db = require("./../db");
const puppeteer = require("puppeteer");
var ObjectId = require("mongodb").ObjectID;
const { getRangeWorkingTime } = require("./../utils");
const { MANAGER_WORKING_TIME, CLEANER_WORKING_TIME } = require("./../constant");

const getAllJobs = async function (req, res) {
  const offset = Number(req.query.offset || 0);
  const limit = Number(req.query.limit || 10);

  db.get()
    .collection("job")
    .aggregate([
      { $sort: { updatedAt: -1 } },
      {
        $lookup: {
          from: "customer",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $skip: offset,
      },
      {
        $limit: limit,
      },
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
            jobs,
            hasMore: jobs.length === limit,
            offset: offset + jobs.length,
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
      const newCustomer = await db
        .get()
        .collection("customer")
        .insertOne(customerInfo);

      return newCustomer.insertedCount === 1
        ? {
            ...customerInfo,
            _id: new ObjectId(newCustomer.insertedId),
          }
        : null;
    }
    // if exesting -> edit
    await db
      .get()
      .collection("customer")
      .updateOne(
        {
          phone: customerInfo.phone,
        },
        {
          $set: {
            name: customerInfo.name,
            phone: customerInfo.phone,
            email: customerInfo.email,
            address: customerInfo.address,
          },
        }
      );
    return { ...customerInfo, _id: new ObjectId(customerRes._id) };
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
  const insertedCustomer = await addCustomerPhoneNumber({
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    address: req.body.address,
  });
  if (!insertedCustomer) {
    res.send({
      error: 1,
      message: "Created job failed",
    });
    return;
  }
  const cleaningTool = req.body.cleaningTool;
  const [priceInfo, paymentMethod, cleaningToolFee] = await getBasicFeeDb();
  const total = calculateTotalFee(
    {
      durationTime: req.body.durationTime,
      cleaningTool,
      numberOfCleaners: req.body.numberOfCleaners
        ? Number(req.body.numberOfCleaners)
        : 1,
    },
    priceInfo,
    cleaningToolFee
  );
  const job = new Job({
    ...req.body,
    customerId: insertedCustomer._id,
    total,
    cleaningToolFee: JSON.stringify(cleaningToolFee),
  });

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
  const editedData = new Job({ ...req.body });
  if (editedData.customerId && req.body.customerId) {
    editedData.customerId = new ObjectId(req.body.customerId);
  }
  if (req.body.cleanerId) {
    const cleanerId = req.body.cleanerId;
    editedData.cleanerId = cleanerId.map((id) => new ObjectId(id));
  }

  // re-calculate the total price
  const priceInfo = {
    one_hour: Number(editedData.pricePerHour),
    from_two_hour: Number(editedData.pricePerHour),
  };

  const cleaningToolFee = editedData.cleaningToolFee;
  const basicInfo = {
    durationTime: Number(editedData.durationTime),
    cleaningTool: editedData.cleaningTool,
    numberOfCleaners: editedData.numberOfCleaners
      ? Number(editedData.numberOfCleaners)
      : 1,
  };
  const totalPrice = calculateTotalFee(basicInfo, priceInfo, cleaningToolFee);

  const dataUpdate = {
    ...editedData._doc,
    total: totalPrice,
  };
  delete dataUpdate._id;
  const result = await db
    .get()
    .collection("job")
    .updateOne(
      {
        _id: new ObjectId(req.params.jobId),
      },
      {
        $set: dataUpdate,
      },
      { upsert: true }
    );
  if (result.matchedCount === 1) {
    res.send({
      data: {
        error: 0,
        message: "Updated successfully",
        data: { ...dataUpdate, _id: req.params.jobId },
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
    const priceDb = await db.get().collection("price_per_hour").findOne();
    priceInfo = {
      ...priceDb,
      one_hour: Number(priceDb.one_hour),
      from_two_hour: Number(priceDb.from_two_hour),
    };

    const paymentMethodDb = await db
      .get()
      .collection("payment_method")
      .find()
      .toArray();
    paymentMethod = paymentMethodDb.length ? paymentMethodDb : paymentMethod;
    const cleaningToolsFeeDb = await db
      .get()
      .collection("price_cleaning_tool")
      .findOne();
    cleaningToolFee = {
      ...cleaningToolsFeeDb,
      basic: Number(cleaningToolsFeeDb.basic),
      vacuum: Number(cleaningToolsFeeDb.vacuum),
    };
  } catch (e) {
    return [priceInfo, paymentMethod, cleaningToolFee];
  }
  return [priceInfo, paymentMethod, cleaningToolFee];
}

async function editPriceInfo(req, res) {
  const id = new ObjectId(req.params.id);
  const priceEdit = req.body;
  const result = await db.get().collection("price_per_hour").updateOne(
    {
      _id: id,
    },
    {
      $set: priceEdit,
    }
  );
  if (result.matchedCount === 1) {
    res.send({
      data: {
        error: 0,
        message: "Update price info successfully",
        priceInfo: {
          id,
          ...priceEdit,
        },
      },
    });
    return;
  }
  res.send({
    data: {
      error: 1,
      message: "Id is incorrect",
    },
  });
}

/* 
  * If sending timestamp (ST)
  1. manager workingtime (MW): 7am-10pm 
  2. cleaner workingtime (CW): 8am-7pm
  - ST C- MW: workingtime allowment =
    if(ST + 3 C- CW) {
      return [ST + 3 -> end_CW]
    }
    if (ST + 3 > end_CW) {
      return [CW] of next day
    }
    return [CW] of today 
  - ST !C- MW 
    return next cleaner workingtime + 2: [start_CW + 2 -> end_CW]
*/
const hourMillisecond = 60 * 60 * 1000;
function getValidWorkingTime(timeStamp, timeZone) {
  // calculate valid workingtime
  const clienTimeZone = timeZone;
  const oneDate = 24 * 60 * 60 * 1000;

  // const sendingTimeStamp =
  //   timeStamp && localTimezone === clienTimeZone
  //     ? timeStamp
  //     : timeStamp
  //     ? zeroTimeZoneForClientTS
  //     : Date.now() + localTimeOffset;
  const sendingTimeStamp = timeStamp || Date.now();

  const ARRANGEMENT_TIME = 3 * hourMillisecond;
  const managerWorkingTime = getRangeWorkingTime(
    { timeStamp: sendingTimeStamp, timeZone: clienTimeZone },
    MANAGER_WORKING_TIME
  );
  const cleanerWorkingTime = getRangeWorkingTime(
    { timeStamp: sendingTimeStamp, timeZone: clienTimeZone },
    CLEANER_WORKING_TIME
  );

  // ST C- MW
  if (
    sendingTimeStamp >= managerWorkingTime.start &&
    sendingTimeStamp <= managerWorkingTime.end
  ) {
    const extendedTime = sendingTimeStamp + ARRANGEMENT_TIME;
    // if(ST + 3 C- CW) {
    //   return [ST + 3 -> end_CW]
    // }
    if (
      extendedTime >= cleanerWorkingTime.start &&
      extendedTime <= cleanerWorkingTime.end
    ) {
      return {
        start: extendedTime,
        end: cleanerWorkingTime.end,
        timeZone: clienTimeZone,
      };
    }

    // if (ST + 3 > end_CW) {
    //   return [CW] of next day
    // }
    if (extendedTime > cleanerWorkingTime.end) {
      const oneDate = 24 * 60 * 60 * 1000;
      const tmr = sendingTimeStamp + oneDate;
      return {
        ...getRangeWorkingTime({ timeStamp: tmr }, CLEANER_WORKING_TIME),
        timeZone: clienTimeZone,
      };
    }

    // return [CW] of today
    return cleanerWorkingTime;
  }

  // - ST !C- MW
  // return next cleaner workingtime + 2: [start_CW + 2 -> end_CW]
  return {
    ...getRangeWorkingTime(
      { timeStamp: sendingTimeStamp + oneDate, timeZone: clienTimeZone },
      {
        ...CLEANER_WORKING_TIME,
        START: CLEANER_WORKING_TIME.START + 3, // 3h for Manager arrange cleaners
      }
    ),
  };
}

/*
  body: 
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
  // calculate valid workingtime
  const clienTimeZone = req.body.requestedTime?.timeZone
    ? Number(req.body.requestedTime?.timeZone)
    : null;
  const sendingTimeStamp = req.body.requestedTime?.timeStamp
    ? Number(req.body.requestedTime?.timeStamp)
    : null;

  const validWorkingTime = getValidWorkingTime(sendingTimeStamp, clienTimeZone);

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
        pricePerHour: priceInfo,
        paymentMethod,
        cleaningToolFee: cleaningToolFee,
        total: totalFee,
        validWorkingTime: {
          ...validWorkingTime,
          dailyCleanerWorking: {
            start: CLEANER_WORKING_TIME.START,
            end: CLEANER_WORKING_TIME.END,
          },
        },
        numberOfCleaners: req.body.numberOfCleaners || 1,
      },
    });
    return;
  } catch (e) {
    res.send({
      error: e,
      data: {
        pricePerHour: priceInfo,
        paymentMethod,
        cleaningToolFee,
      },
    });
  }
};

// Calculate total fee
const MIN_TIME = 120;
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
    numberOfCleaners: basicInfoReq.numberOfCleaners
      ? Number(basicInfoReq.numberOfCleaners)
      : 1,
  };
  const usingPrice =
    basicInfo.durationTime < MIN_TIME
      ? priceInfo.one_hour
      : priceInfo.from_two_hour;

  const pricePerMin = usingPrice / 60;
  const totalCleaningToolFee =
    basicInfo.cleaningTool.basic * cleaningToolFee.basic +
    basicInfo.cleaningTool.vacuum * cleaningToolFee.vacuum;

  const totalFee =
    Math.round(basicInfo.durationTime * pricePerMin) *
      basicInfo.numberOfCleaners +
    totalCleaningToolFee;

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

function getJobDetail(req, res) {
  const jobId = new ObjectId(req.params.jobId || 0);
  db.get()
    .collection("job")
    .aggregate([
      { $match: { _id: jobId } },
      {
        $lookup: {
          from: "customer",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $limit: 1,
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
            message: "Get job successfully",
            job: jobs.length ? jobs[0] : null,
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
}

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
  editPriceInfo,
  getJobDetail,
};
