/** @format */

const mongoose = require("mongoose");
var ObjectId = require("mongodb").ObjectID;
const Schema = mongoose.Schema;

const jobSchema = new Schema(
  {
    customerId: {
      type: ObjectId,
      required: false,
    },
    cleanerId: {
      type: ObjectId,
      required: false,
    },
    preferDate: {
      type: Date, // should be correct both date and time
      required: false,
    },
    alternativeDate: {
      type: Date, // should be correct both date and time
      required: false,
    },
    cleaningToolFee: {
      type: Number,
      default: 0,
    },
    workingAddress: {
      type: String,
    },
    paymentMethodId: {
      type: ObjectId,
    },
    pricePerHour: {
      type: Number,
      default: 60000,
    },
    unit: {
      type: String,
      default: "vnd",
    },
    feeInfo: {
      type: String,
      // fee_info
      // {
      //    paid_cleaner_amount: 100000,
      //    customer_paid_amount: 120000,
      //    extra_fee: 30000,
      //    note: include vacuum cleaner
      // }
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);
jobSchema.set("timestamps", true);
const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
