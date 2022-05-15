const db = require("./../db");
var ObjectId = require("mongodb").ObjectID;

async function getCleaningTools() {
  const cleaningToolsFeeDb = await db
    .get()
    .collection("price_cleaning_tool")
    .findOne();
  if (cleaningToolsFeeDb) {
    return {
      ...cleaningToolsFeeDb,
      basic: Number(cleaningToolsFeeDb.basic),
      vacuum: Number(cleaningToolsFeeDb.vacuum),
    };
  }
  return {
    basic: 0,
    vacuum: 0,
  };
}

async function requestCleaningToolServer(req, res) {
  const data = await getCleaningTools();
  if (data && data.basic === 0) {
    res.send({
      error: 1,
      message: "Get cleaning tool failed",
    });
    return;
  }
  res.send({
    error: 1,
    message: "Get cleaning tool successfully",
    cleaningTool: data,
  });
}

async function editCleaningToolPrice(req, res) {
  const cleaningToolId = new ObjectId(req.params.id);
  const insertedData = {
    ...req.body,
  };
  try {
    const result = await db.get().collection("price_cleaning_tool").updateOne(
      {
        _id: cleaningToolId,
      },
      {
        $set: insertedData,
      },
      { upsert: true }
    );
    if (result.matchedCount === 1) {
      res.send({
        data: {
          error: 0,
          message: "Updated successfully",
          data: { ...insertedData, _id: cleaningToolId },
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
  getCleaningTools,
  requestCleaningToolServer,
  editCleaningToolPrice,
};
