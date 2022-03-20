/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var ObjectId = require("mongodb").ObjectID;

const paymentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      required: false,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
paymentSchema.set("timestamps", true);
const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
