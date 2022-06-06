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
      type: [ObjectId],
      required: false,
    },
    cleaner: {
      type: Array,
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
    durationTime: {
      type: Number, // minutes
      required: true,
    },
    cleaningTool: {
      type: Object,
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
    startWorkingTime: {
      type: String,
    },
    totalPrice: {
      type: Number,
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
    customerNote: {
      type: String,
    },
    adminNote: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    updatedAt: {
      type: Date,
      default: new Date(),
    },
    cleaningToolFee: {
      type: String,
    },
    numberOfCleaners: {
      type: Number,
      default: 1,
    },
    total: {
      type: Number,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);
jobSchema.set("timestamps", true);
const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
