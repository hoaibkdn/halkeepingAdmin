/** @format */

const express = require("express");
const router = express.Router();
const ProductController = require("./../controllers/ProductController");

router.post("/add-product", ProductController.creatProduct);
router.get("/get-products", ProductController.getProducts);
router.get("/search-products", ProductController.getProducts);
router.get("/get-product/:productId", ProductController.getProductById);
router.delete("/delete-product/:productId", ProductController.removeProduct);

module.exports = router;
