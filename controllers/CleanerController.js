const Cleaner = require("./../models/Cleaner");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./../db");
var ObjectId = require("mongodb").ObjectID;

const addCleaner = function (req, res, next) {
  console.log("cleaner content ", req);
  if(!req.body.name) {
    res.send({
      data: {
        error: 1,
        message: "Data is not empty",
      },
    }); 
    return
  }
  const cleaner = new Cleaner(req.body);
  try {
    db.get()
      .collection("cleaner")
      .insertOne(cleaner)
      .then(() => {
        res.send({
          data: {
            error: 0,
            message: "Added cleaner successfully",
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
  addCleaner,
};
