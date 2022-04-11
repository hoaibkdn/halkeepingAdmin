/** @format */

const express = require("express");
const router = express.Router();
const WorkingHourController = require("./../controllers/WorkingHourController");

router.get("/get", WorkingHourController.requestWorkingHourServer);

module.exports = router;
