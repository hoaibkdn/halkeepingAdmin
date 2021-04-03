/** @format */

const express = require("express");
const router = express.Router();
const db = require("../db");
const SectionController = require("../controllers/SectionController");

router.post("/add-section", SectionController.addDataSection);
router.get("/get-section/:sectionName", SectionController.getDataSection);

module.exports = router;
