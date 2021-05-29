/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// var ObjectId = require("mongodb").ObjectID;

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: true,
    },
    origin: {
      type: String,
      require: true,
    },
    image: {
      type: String,
    },
    // {
    //   min: 45000,
    //   max: 145000
    // }
    price: {
      type: String, // Json object
    },
    // {
    //   shopee: 'url',
    //   lazada: 'url',
    //   sendo: 'url',
    //   tiki: 'url'
    // }
    shopConnection: {
      type: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);
sectionSchema.set("timestamps", true);
const Section = mongoose.model("Section", sectionSchema);
module.exports = Section;
