/** @format */

const express = require("express");
const router = express.Router();
const db = require("./../db");
const CustomerController = require("./../controllers/CustomerController");

router.post("/add-customer", CustomerController.addCustomer);

module.exports = router;
