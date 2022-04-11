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

module.exports = {
  getCleaningTools,
  requestCleaningToolServer,
};
