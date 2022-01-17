const Customer = require("./../models/Cleaner");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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

const addCustomer = function (req, res, next) {
  const customer = new Customer(req.body);
  console.log("customer ===> ", customer);
  try {
    db.get()
      .collection("customer")
      .insertOne(customer)
      .then(() => {
        res.send({
          data: {
            error: 0,
            message: "Added customer successfully",
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
};

module.exports = {
  addCustomer,
  getAllCustomers,
};
