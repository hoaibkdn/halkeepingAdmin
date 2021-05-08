/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ROLE = {
  1: "admin",
  2: "mode",
};
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    birthday: {
      type: Date,
    },
    role: {
      type: Number,
      default: 2,
    },
    webId: {
      type: String,
      required: true,
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
userSchema.set("timestamps", true);
const User = mongoose.model("User", userSchema);
module.exports = User;
