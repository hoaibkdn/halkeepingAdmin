/** @format */

const express = require("express");
const router = express.Router();
const CleaningToolController = require("./../controllers/CleaningToolController");

router.get("/get", CleaningToolController.requestCleaningToolServer);

module.exports = router;
