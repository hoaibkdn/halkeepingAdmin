const fetch = require("node-fetch");
const { PROVINCE_CODE } = require("./../constant");
const provinceHost = "https://provinces.open-api.vn/api/";

function getProvinces(req, res) {
  const code = req.query.code || PROVINCE_CODE.DA_NANG;

  const queryParams = "?depth=3";
  fetch(provinceHost + queryParams)
    .then((res) => res.text())
    .then((text) => {
      const allProvinces = JSON.parse(text);
      const result = allProvinces.find((item) => item.code == code);
      res.send({
        error: 0,
        province: result,
      });
    });
}

module.exports = {
  getProvinces,
};
