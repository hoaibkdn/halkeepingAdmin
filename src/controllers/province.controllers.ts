import fetch from 'node-fetch';
import { requestHandler } from '../middleware/request.middleware';
import { RequestHandler } from 'express';
// const provinceHost = 'https://provinces.open-api.vn/api/';
const provinceHost = 'https://vapi.vnappmob.com/api/province/district/';
// @Reference: https://vapi-vnappmob.readthedocs.io/en/latest/province.html

const PROVINCE_CODE = {
  DA_NANG: 48,
  HA_NOI: 1,
};

export const getDistricts: RequestHandler = async (req, res) => {
  const code = req.query.code || PROVINCE_CODE.DA_NANG;
  try {
    const response = await fetch(provinceHost + code);
    const provincesText = await response.text();
    const allProvinces = JSON.parse(provincesText);

    const result = allProvinces.results;
    res.send({
      error: 0,
      province: result,
    });
  } catch (e) {
    res.send({
      error: e,
      province: [],
    });
  }
};

export const getProvinces = requestHandler(getDistricts, { skipJwtAuth: true });
