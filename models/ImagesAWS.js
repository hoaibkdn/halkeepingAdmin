/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// var ObjectId = require("mongodb").ObjectID;

const imageSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);
imageSchema.set("timestamps", true);
const Image = mongoose.model("Image", imageSchema);
module.exports = Image;
