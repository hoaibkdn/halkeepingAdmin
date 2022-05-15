/** @format */

const express = require("express");
const router = express.Router();
const CleaningToolController = require("./../controllers/CleaningToolController");

router.get("/get", CleaningToolController.requestCleaningToolServer);
router.put("/edit/:id", CleaningToolController.editCleaningToolPrice);

module.exports = router;
