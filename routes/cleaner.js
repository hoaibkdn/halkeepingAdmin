/** @format */

const express = require("express");
const router = express.Router();
const CleanerController = require("./../controllers/CleanerController");

router.post("/add", CleanerController.addCleaner);
router.get("/", CleanerController.getCleaners);
router.get('/detail/id', CleanerController.getCleanerById)
router.post('/update/id', CleanerController.editCleaner)
module.exports = router;
