/** @format */

const express = require("express");
const router = express.Router();
const JobController = require("./../controllers/JobController");

router.post("/create", JobController.createNewJob);
router.get("/get-basic", JobController.getBasicJobInfo);
router.get("/all", JobController.getAllJobs);
router.get("/init", JobController.initBasicJobInfo);
router.patch("/edit/:jobId", JobController.editJob);
router.get("/download", JobController.downloadPdfBill);
module.exports = router;
