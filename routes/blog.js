/** @format */

const express = require("express");
const router = express.Router();
const BlogController = require("./../controllers/BlogController");

router.post("/add-blog", BlogController.createBlog);
router.get("/get-blogs", BlogController.getBlogs);
router.get("/get-blog/:blogId", BlogController.getBlogById);
router.delete("/delete-blog/:blogId", BlogController.removeBlog);

module.exports = router;
