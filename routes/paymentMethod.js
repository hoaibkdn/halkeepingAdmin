/** @format */

const express = require("express");
const router = express.Router();
const PaymentMethodsController = require("./../controllers/PaymentMethodsController");

router.get("/", PaymentMethodsController.getAllPaymentMethods);
router.post("/add", PaymentMethodsController.addPaymentMethod);

module.exports = router;
