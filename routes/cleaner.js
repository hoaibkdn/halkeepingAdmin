/** @format */

const express = require("express");
const router = express.Router();
const db = require("./../db");
const CleanerController = require("./../controllers/CleanerController");

router.post("/add-cleaner", CleanerController.addCleaner);

module.exports = router;
