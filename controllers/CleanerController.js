const Cleaner = require("./../models/Cleaner");
var ObjectId = require("mongodb").ObjectID;
const db = require("./../db");

const addCleaner = function (req, res, next) {
  const isInvalidCleaner =
    !req.body.name || !req.body.phone || !req.body.address;
  if (isInvalidCleaner) {
    res.send({
      data: {
        error: 1,
        message: "Data is not empty",
      },
    });
    return;
  }
  const cleaner = new Cleaner({ ...req.body, isActive: true });
  try {
    db.get()
      .collection("cleaner")
      .insertOne(cleaner)
      .then((cleanerData) => {
        res.send({
          data: {
            error: 0,
            message: "Added cleaner successfully",
            cleaner: cleanerData.ops[0],
          },
        });
      });
  } catch (error) {
    res.send({
      error: 1,
      message: error.message,
    });
  }
};

function getCleaners(req, res) {
  const offset = Number(req.query.offset || 0);
  const limit = Number(req.query.limit || 10);
  try {
    db.get()
      .collection("cleaner")
      .aggregate([
        {
          $skip: offset,
        },
        {
          $limit: limit,
        },
        { $sort: { updatedAt: -1 } },
      ])
      .toArray(function (err, cleaners) {
        if (err) {
          res.send({
            error: 1,
            message: "Get cleaners error",
          });
          return;
        }
        const hasMore = cleaners.length >= limit;
        res.send({
          error: 0,
          message: "Get cleaners successfully",
          cleaners,
          nextOffset: hasMore ? offset + limit : offset,
          hasMore,
        });
      });
  } catch (error) {
    console.log(error);
    res.send({
      error: 1,
      message: "Get cleaners error",
    });
  }
}

function getCleanerById(req, res) {
  const id = new ObjectId(req.params.id);
  if (!id) {
    res.send({
      data: {
        error: 1,
        message: "Please provide id",
      },
    });
    return;
  }

  db.get()
    .collection("cleaner")
    .findOne(
      {
        _id: id,
      },
      function (err, cleaner) {
        if (err) {
          res.send({
            data: {
              error: 1,
              message: "Get cleaner error",
            },
          });
          return;
        }
        return res.send({
          data: {
            error: 0,
            message: "Get cleaner successfully",
            cleaner,
          },
        });
      }
    );
}

const editCleaner = async function (req, res) {
  const isInvalidCleaner =
    !req.body.name || !req.body.phone || !req.body.address;
  const cleanerId = req.params.id ? new ObjectId(req.params.id) : null;
  if (isInvalidCleaner || !cleanerId) {
    res.send({
      data: {
        error: 1,
        message: "Data is not empty",
      },
    });
    return;
  }
  const editedData = new Cleaner({ ...req.body });
  const insertedDat = {
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address,
    facebook: req.body.facebook,
    zalo: req.body.zalo,
    isActive: req.body.isActive,
    extra_info: req.body.extraInfo,
    updatedAt: editedData.updatedAt,
  };
  try {
    const result = await db.get().collection("cleaner").updateOne(
      {
        _id: cleanerId,
      },
      {
        $set: insertedDat,
      },
      { upsert: true }
    );
    if (result.matchedCount === 1) {
      res.send({
        data: {
          error: 0,
          message: "Updated successfully",
          data: { ...insertedDat, _id: cleanerId },
        },
      });
      return;
    }
  } catch (error) {
    res.send({
      error: 1,
      message: error.message,
    });
  }
};

module.exports = {
  addCleaner,
  getCleaners,
  getCleanerById,
  editCleaner,
};
