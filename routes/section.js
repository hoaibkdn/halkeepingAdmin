/** @format */

const express = require("express");
const router = express.Router();
const SectionController = require("../controllers/SectionController");

router.post("/add-section", SectionController.addDataSection);
router.get("/get-section/:sectionName", SectionController.getDataSection);
router.get(
  "/get-batch-sections/:sections",
  SectionController.getBatchOfSections
);
router.put("/edit-section/:sectionName", SectionController.updateSection);
router.delete("/remove/:sectionName", SectionController.removeSection);
router.post("/send-email", SectionController.sendEmail);
router.post("/send-checkin", SectionController.sendCheckinForm);
router.get("/get-data-list", SectionController.getDataBySectionName);

module.exports = router;
