const Payment = require("./../models/PaymentMethod");
const db = require("./../db");
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
  const id = req.body._id ? new ObjectId(req.body._id) : undefined;
  const updateContent = { ...req.body };
  delete updateContent._id;
  try {
    if (id) {
      const result = await db.get().collection("payment_method").updateOne(
        {
          _id: id,
        },
        {
          $set: updateContent,
        }
      );
      if (result.matchedCount === 1 || result.upsertedCount === 1) {
        res.send({
          error: 0,
          message: "Updated successfully",
        });
        return;
      }
      res.send({
        error: 1,
        message: "Payment method does not match",
      });
    } else {
      const result = await db
        .get()
        .collection("payment_method")
        .insertOne(req.body);

      if (result.insertedCount) {
        res.send({
          error: 0,
          message: "Add successfully",
          data: {
            ...req.body,
            _id: result.insertedId,
          },
        });
        return;
      }
      res.send({
        error: 1,
        message: "Add payment method failed",
      });
    }
  } catch (e) {
    res.send({
      error: e,
      message: "There is an error occur",
    });
  }
}

async function deletePaymentMethod(req, res) {
  const paymentId = req.params.paymentId;

  if (paymentId) {
    await db
      .get()
      .collection("payment_method")
      .deleteOne({ _id: new ObjectId(paymentId) }, true);
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
      message: "No payment corresponding",
    },
  });
}

module.exports = {
  getAllPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
};
