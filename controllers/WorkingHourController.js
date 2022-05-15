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
    error: 0,
    message: "Get working hour successfully",
    workingHour: data,
  });
}

async function editWorkingHour(req, res) {
  const workingId = new ObjectId(req.params.id);
  const updatedData = {
    ...req.body,
  };
  try {
    const result = await db.get().collection("price_per_hour").updateOne(
      {
        _id: workingId,
      },
      {
        $set: updatedData,
      },
      { upsert: true }
    );
    if (result.matchedCount === 1) {
      res.send({
        data: {
          error: 0,
          message: "Updated successfully",
          data: { ...updatedData, _id: workingId },
        },
      });
      return;
    }
    res.send({
      error: 1,
      message: "Id is not correct",
    });
  } catch (error) {
    res.send({
      error: 1,
      message: error.message,
    });
  }
}

module.exports = {
  getWorkingHourPrice,
  requestWorkingHourServer,
  editWorkingHour,
};
