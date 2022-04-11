const db = require("./../db");
var ObjectId = require("mongodb").ObjectID;

async function getWorkingHourPrice() {
  const priceDb = await db.get().collection("price_per_hour").findOne();
  if (priceDb) {
    return {
      ...priceDb,
      one_hour: Number(priceDb.one_hour),
      from_two_hour: Number(priceDb.from_two_hour),
    };
  }
  return {
    one_hour: 0,
    from_two_hour: 0,
  };
}

async function requestWorkingHourServer(req, res) {
  const data = await getWorkingHourPrice();
  if (data && data.one_hour === 0) {
    res.send({
      error: 1,
      message: "Get working hour failed",
    });
    return;
  }
  res.send({
    error: 1,
    message: "Get working hour successfully",
    workingHour: data,
  });
}

module.exports = {
  getWorkingHourPrice,
  requestWorkingHourServer,
};
