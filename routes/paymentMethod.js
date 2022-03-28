/** @format */

const express = require("express");
const router = express.Router();
const PaymentMethodsController = require("./../controllers/PaymentMethodsController");

router.get("/", PaymentMethodsController.getAllPaymentMethods);
router.post("/add", PaymentMethodsController.addPaymentMethod);
router.delete("/delete/:paymentId", PaymentMethodsController.deletePaymentMethod);
module.exports = router;
