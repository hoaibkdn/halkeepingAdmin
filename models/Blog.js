/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var ObjectId = require("mongodb").ObjectID;

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: Array,
      required: false,
    },
    section: {
      type: String,
      require: false,
    },
    origin: {
      type: String,
      require: true,
    },
    images: {
      type: Array,
      required: false,
    },
    blogId: {
      type: ObjectId,
      required: false,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
blogSchema.set("timestamps", true);
const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
