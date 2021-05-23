/** @format */

const express = require("express");
const router = express.Router();
const db = require("../db");
const SectionController = require("../controllers/SectionController");
const cors = require("cors");

router.post("/add-section", cors(), SectionController.addDataSection);
router.get(
  "/get-section/:sectionName",
  cors(),
  SectionController.getDataSection
);
router.post(
  "/edit-section/:sectionName",
  cors(),
  SectionController.addDataSection
);
router.delete("/remove/:sectionName", cors(), SectionController.removeSection);
router.post("/send-email", cors(), SectionController.sendEmail);
module.exports = router;
