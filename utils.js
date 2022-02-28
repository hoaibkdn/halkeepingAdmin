const checkAuthorization = function (req, res) {
  res.send({
    data: {
      error: 1,
      status: 401,
      message: "Unauthorization",
    },
  });
  return;
};

// { 0: [param, param], 1: [param, param]}
const mergeS3Parram = (s3Params) => {
  return Object.values(s3Params).reduce((total, item) => {
    const mergedArr = total.concat(item);
    return mergedArr;
  }, []);
};

/**
 *
 * @param {Array} values
 * values = [{
 *   Location: string
 * }, {
 *   Location: string
 * }, {
 *   Location: string
 * }]
 * @param {Object} s3Params
 *  s3Params = { 0: [], 1: [], 2: [], 3: [{}, {}, {}] };
 *
 * @param {Object} convertedData
 * convertedData.images[x]= ["url"]
 */
const mapS3ImageToConvertedData = (values, s3Params, convertedData) => {
  let currentArrUploadedImg = 0;
  let trackingParams = {};
  values.forEach((item, index) => {
    if (s3Params[0] && s3Params[0].length > index) {
      convertedData.images.push(item.Location);
      currentArrUploadedImg = s3Params[0].length; // 2
      trackingParams[0] = s3Params[0].length;
    } else {
      Object.keys(s3Params).forEach((key) => {
        const keyNum = Number(key);

        if (
          keyNum > 0 &&
          s3Params[key].length &&
          s3Params[key].length + currentArrUploadedImg >= index &&
          index >= currentArrUploadedImg &&
          (!trackingParams[key] || trackingParams[key] < s3Params[key].length)
        ) {
          if (convertedData.data[keyNum - 1]) {
            convertedData.data[keyNum - 1].images.push(item.Location);
          } else {
            convertedData.data = convertedData.data.concat({
              images: [item.Location],
            });
          }
          currentArrUploadedImg++;
          if (trackingParams[key]) {
            trackingParams[key]++;
          } else {
            trackingParams = { ...trackingParams, [key]: 1 };
          }
        }
      });
    }
  });
};

function convertStringArrToArray(stringArr = "") {
  if (stringArr === "null" || stringArr === "undefined") {
    return [];
  }
  return stringArr.split(",");
}

function getRangeWorkingTime(date, rangeWorkingTime) {
  const localTimezone = (new Date().getTimezoneOffset() / 60) * -1;
  const { timeStamp, timeZone } = date;
  const clienTimeZone = timeZone || localTimezone;
  const dateTime = new Date(timeStamp);
  const dateOfMonth = dateTime.getDate();
  const month = dateTime.getMonth();
  const year = dateTime.getFullYear();
  return {
    start: new Date(
      year,
      month,
      dateOfMonth,
      rangeWorkingTime.START + clienTimeZone,
      0,
      0
    ).getTime(),
    end: new Date(
      year,
      month,
      dateOfMonth,
      rangeWorkingTime.END + clienTimeZone,
      0,
      0
    ).getTime(),
  };
}

module.exports = {
  checkAuthorization,
  mergeS3Parram,
  mapS3ImageToConvertedData,
  convertStringArrToArray,
  getRangeWorkingTime,
};
