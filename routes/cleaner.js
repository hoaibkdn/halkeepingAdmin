/** @format */

const express = require("express");
const router = express.Router();
const CleanerController = require("./../controllers/CleanerController");

router.post("/add-cleaner", CleanerController.addCleaner);
router.get("/", CleanerController.getCleaners);
module.exports = router;
