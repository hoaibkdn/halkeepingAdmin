/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const checkinSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    section: {
      type: String,
      require: false,
    },
    address: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      required: false,
    },
    birthday: {
      type: String,
      required: false,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
checkinSchema.set("timestamps", true);
const Checkin = mongoose.model("Checkin", checkinSchema);
module.exports = Checkin;
