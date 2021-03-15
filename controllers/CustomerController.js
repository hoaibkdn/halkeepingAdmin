const Customer = require("./../models/Cleaner");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./../db");
var ObjectId = require("mongodb").ObjectID;

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
};
