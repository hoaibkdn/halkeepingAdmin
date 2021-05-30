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
    category: {
      type: String,
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
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);
productSchema.set("timestamps", true);
const Section = mongoose.model("Section", productSchema);
module.exports = Section;
