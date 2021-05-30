const Category = require("./../models/Category");
const db = require("./../db");
var ObjectId = require("mongodb").ObjectID;

function createCategory(req, res) {
  const category = new Category({
    ...req.body,
  });

  const categoryId = category._id;
  const insertCategory = () => {
    db.get()
      .collection("category")
      .insertOne(category)
      .then(() => {
        res.send({
          data: {
            error: 0,
            message: "Added successfully",
            category,
          },
        });
      });
  };
  try {
    db.get()
      .collection("category")
      .findOne(
        {
          _id: new ObjectId(categoryId),
        },
        async function (err, category) {
          if (!category) {
            // create new category
            insertCategory();
          } else {
            delete category._id;
            const result = await db.get().collection("category").updateOne(
              {
                _id: categoryId,
              },
              {
                $set: category,
              },
              { upsert: true }
            );
            if (result.matchedCount === 1) {
              res.send({
                data: {
                  error: 0,
                  message: "Updated successfully",
                  category,
                },
              });
              return;
            }
            res.send({
              data: {
                error: 1,
                message: "There is an error occur",
              },
            });
          }
        }
      );
  } catch (error) {}
}

function getCategories(req, res) {
  const section = req.query.section;
  const origin = req.query.origin;
  if (!section || !origin) {
    res.send({
      data: {
        error: 1,
        message: "Please provide section and domain",
      },
    });
    return;
  }

  db.get()
    .collection("category")
    .find({
      section,
      origin,
    })
    .toArray(function (err, categories) {
      if (err) {
        res.send({
          data: {
            error: 1,
            message: "Get category error",
          },
        });
        return;
      }
      return res.send({
        data: {
          error: 0,
          categories,
        },
      });
    });
}

async function removeCategory(req, res) {
  const categoryId = req.params.categoryId;
  if (categoryId) {
    await db
      .get()
      .collection("category")
      .deleteOne({ _id: ObjectId(categoryId) }, true);
    res.send({
      data: {
        error: 0,
        message: "Delete successfully",
      },
    });
    return;
  }
  res.send({
    data: {
      error: 1,
      message: "No category corresponding",
    },
  });
}

module.exports = {
  createCategory,
  getCategories,
  removeCategory,
};
