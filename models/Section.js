/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// var ObjectId = require("mongodb").ObjectID;

const sectionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    section: {
      type: String | Number,
      // require: true
    },
    origin: {
      type: String,
      require: true,
    },
    images: {
      type: Array,
      // {1: id, 2: imageid}
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
sectionSchema.set("timestamps", true);
const Section = mongoose.model("Section", sectionSchema);
module.exports = Section;
