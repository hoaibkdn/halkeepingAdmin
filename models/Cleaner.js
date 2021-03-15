/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cleanerSchema = new Schema(
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
    },
    facebook: {
      type: String, // name of fb or url
      required: false,
    },
    zalo: {
      type: String, // name of fb or url
    },
    joinedDate: {
      type: Date,
      default: Date.now(),
    },
    isActive: {
      type: Boolean,
      default: true,
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
cleanerSchema.set("timestamps", true);
const Cleaner = mongoose.model("Cleaner", cleanerSchema);
module.exports = Cleaner;
