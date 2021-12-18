/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
      // json:
      // {"quan":"Hai Chau","huyen":"Hai Chau 2","detail":"30 Ngo Quyen"}
    },
    email: {
      type: String,
      required: true,
    },
    facebook: {
      type: String, // name of fb or url
      required: false,
    },
    zalo: {
      type: String, // name of fb or url
    },
    extra_info: {
      type: String,
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
customerSchema.set("timestamps", true);
const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
