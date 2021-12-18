/** @format */

const express = require("express");
const router = express.Router();
const JobController = require("./../controllers/JobController");

router.post("/create", JobController.createNewJob);
router.get("/all", JobController.getAllJobs);
router.patch("/edit/:jobId", JobController.editJob);
router.get("/download", JobController.downloadPdfBill);
module.exports = router;
