const Payment = require("./../models/PaymentMethod");
const db = require("./../db");
const puppeteer = require("puppeteer");
var ObjectId = require("mongodb").ObjectID;

async function getPaymentMethodsFromDb() {
  const paymentMethodDb = await db
    .get()
    .collection("payment_method")
    .find()
    .toArray();
  return paymentMethodDb;
}

async function getAllPaymentMethods(req, res) {
  try {
    const paymentMethods = await getPaymentMethodsFromDb();
    res.send({
      error: 0,
      message: "Get payment methods successfully",
      data: paymentMethods,
    });
  } catch (e) {
    res.send({
      error: 1,
      message: "Get payment methods Failed",
    });
  }
}

async function addPaymentMethod(req, res) {
  const id = req.body.id ? new ObjectId(req.body.id) : undefined;
  try {
    if (id) {
      const result = await db.get().collection("payment_method").updateOne(
        {
          _id: id,
        },
        {
          $set: req.body,
        }
      );
      if (result.matchedCount === 1 || result.upsertedCount === 1) {
        res.send({
          error: 0,
          message: "Updated successfully",
        });
        return;
      }
    } else {
      const result = await db
        .get()
        .collection("payment_method")
        .insertOne(method);
      res.send({
        error: 0,
        message: "Add successfully",
      });
      return;
    }
  } catch (e) {
    res.send({
      error: 1,
      message: "There is an error occur",
    });
  }
}

module.exports = {
  getAllPaymentMethods,
  addPaymentMethod,
};
