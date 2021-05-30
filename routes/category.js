/** @format */

const express = require("express");
const router = express.Router();
const CategoryController = require("./../controllers/CategoryController");

router.post("/add-category", CategoryController.createCategory);
router.get("/get-categories", CategoryController.getCategories);
router.delete(
  "/delete-category/:categoryId",
  CategoryController.removeCategory
);

module.exports = router;
