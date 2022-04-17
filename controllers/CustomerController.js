const Customer = require("./../models/Cleaner");
const db = require("./../db");
var ObjectId = require("mongodb").ObjectID;

const getAllCustomers = async function (req, res) {
  const offset = Number(req.query.offset || 0);
  const limit = Number(req.query.limit || 10);

  db.get()
    .collection("customer")
    .aggregate([
      { $sort: { updatedAt: -1 } },
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
    .then((customers) => {
      if (customers) {
        res.send({
          data: {
            error: 0,
            customers,
            hasMore: customers.length === limit,
            offset: offset + customers.length,
          },
        });
        return;
      }
      res.send({
        data: {
          error: 1,
          message: "Get customers error",
        },
      });
    });
};

async function addOrEditCustomer(req, res) {
  const customerId = req.params.customerId
    ? new ObjectId(req.params.customerId)
    : null;
  const customerRes = await db.get().collection("customer").findOne({
    _id: customerId,
  });
  const customerInfo = {
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    address: req.body.address,
  };
  if (!customerRes) {
    const newCustomer = await db
      .get()
      .collection("customer")
      .insertOne(customerInfo);

    const fullNewData =
      newCustomer.insertedCount === 1
        ? {
            ...customerInfo,
            _id: new ObjectId(newCustomer.insertedId),
          }
        : null;
    res.send({
      error: Boolean(newCustomer.insertedCount !== 1),
      customer: fullNewData,
      message:
        newCustomer.insertedCount === 1
          ? "Added customer successfully"
          : "Added customer failed",
    });
    return;
  }
  // if exesting -> edit
  const dataUpdate = new Customer({
    ...customerInfo,
    createdAt: req.body.createdAt,
  });
  const updatedCus = await db
    .get()
    .collection("customer")
    .updateOne(
      {
        _id: customerId,
      },
      {
        $set: {
          ...customerInfo,
          createdAt: req.body.createdAt,
          updatedAt: dataUpdate.updatedAt,
        },
      }
    );
  const fullUpdatedData = {
    ...dataUpdate._doc,
    _id: new ObjectId(customerRes._id),
  };

  res.send({
    error: Boolean(updatedCus.matchedCount !== 1),
    customer: fullUpdatedData,
    message:
      updatedCus.matchedCount === 1
        ? "Updated customer successfully"
        : "Updated customer failed",
  });
}

function getCustomerById(req, res) {
  const id = new ObjectId(req.params.id);
  if (!id) {
    res.send({
      data: {
        error: 1,
        message: "Please provide id",
      },
    });
    return;
  }

  db.get()
    .collection("customer")
    .findOne(
      {
        _id: id,
      },
      function (err, customer) {
        if (err) {
          res.send({
            data: {
              error: 1,
              message: "Get customer error",
            },
          });
          return;
        }
        return res.send({
          data: {
            error: 0,
            message: "Get customer successfully",
            customer,
          },
        });
      }
    );
}

module.exports = {
  addOrEditCustomer,
  getAllCustomers,
  getCustomerById,
};
