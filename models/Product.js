/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var ObjectId = require("mongodb").ObjectID;

const productSchema = new Schema(
  {
    productId: {
      type: ObjectId,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    categoryId: {
      type: ObjectId,
      required: true,
    },
    origin: {
      type: String,
      require: true,
    },
    images: {
      type: Array,
      require: false,
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
    tag: {
      type: String,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
productSchema.set("timestamps", true);
const Section = mongoose.model("Section", productSchema);
module.exports = Section;
