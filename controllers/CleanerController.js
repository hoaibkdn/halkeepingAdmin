const Cleaner = require("./../models/Cleaner");
const db = require("./../db");

const addCleaner = function (req, res, next) {
  if (!req.body.name) {
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
      .then(() => {
        res.send({
          data: {
            error: 0,
            message: "Added cleaner successfully",
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
      function (err, blog) {
        if (err) {
          res.send({
            data: {
              error: 1,
              message: "Get the blog error",
            },
          });
          return;
        }
        return res.send({
          data: {
            error: 0,
            message: "Get blog successfully",
            blog,
          },
        });
      }
    );
}

const editCleaner = async function (req, res) {
  if (!req.body.name) {
    res.send({
      data: {
        error: 1,
        message: "Data is not empty",
      },
    });
    return;
  }
  const editedData = new Cleaner({ ...req.body });
  const result = await db
    .get()
    .collection("customer")
    .updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $set: editedData,
      },
      { upsert: true }
    );

  if (result.matchedCount === 1) {
    res.send({
      data: {
        error: 0,
        message: "Updated successfully",
        data: { ...editedData, _id: req.params.id },
      },
    });
    return;
  }
  res.send({
    error: 1,
    message: error.message,
  });
};

module.exports = {
  addCleaner,
  getCleaners,
  getCleanerById,
  editCleaner,
};
