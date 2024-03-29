/** @format */

const express = require("express");
const router = express.Router();
const JobController = require("./../controllers/JobController");

router.post("/create", JobController.createNewJob);
router.post("/basic-info", JobController.getBasicJobInfo);
router.get("/all", JobController.getAllJobs);
router.get("/init", JobController.initBasicJobInfo);
router.post("/edit/:jobId", JobController.editJob);
router.get("/download", JobController.downloadPdfBill);
router.post("/edit-price/:id", JobController.editPriceInfo);
router.get("/detail/:jobId", JobController.getJobDetail);
module.exports = router;
