/** @format */

const express = require('express');
const router = express.Router();
const ProvinceController = require('./../controllers/ProvinceController');

router.get('/', ProvinceController.getProvinces);
router.get('/all', ProvinceController.getAllProvinces);

module.exports = router;
