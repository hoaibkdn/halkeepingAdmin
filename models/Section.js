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
      require: true
    },
    image: {
      type: String,
      // {1: id, 2: imageid}
    }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);
sectionSchema.set("timestamps", true);
const Section = mongoose.model("Section", sectionSchema);
module.exports = Section;
