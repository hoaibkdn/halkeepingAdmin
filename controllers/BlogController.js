const db = require("../db");
const sectionController = require("./SectionController");
const utils = require("./../utils");
const ObjectId = require("mongodb").ObjectID;
const multiparty = require("multiparty");
const Blog = require("./../models/Blog");

function createBlog(req, res) {
  let form = new multiparty.Form();
  let convertedData = null;
  let s3Params = { 0: [] };
  let errorUploading = {
    isUploadingError: false,
  };

  let blogModel = null;
  form.parse(req, async function (err, fields, files) {
    if (fields) {
      convertedData = sectionController.convertDataSection(fields);
      blogModel = new Blog({
        title: convertedData.title,
        description: convertedData.data,
        images: convertedData.images,
        origin: convertedData.origin,
        section: convertedData.section,
        blogId: convertedData.blogId,
      });
    }

    if (files) {
      s3Params = await sectionController.parseParamsS3(files);
    }

    // { 0: [param, param], 1: [param, param]}
    // Upload images to S3
    const s3ParamsArray = utils.mergeS3Parram(s3Params);
    Promise.all(
      s3ParamsArray.map((item) =>
        sectionController.getUploadPromise(item, errorUploading)
      )
    ).then((values) => {
      utils.mapS3ImageToConvertedData(values, s3Params, blogModel);

      // Save data to db
      if (!blogModel) {
        res.send({
          data: {
            error: 1,
            message: "Data should not be empty",
          },
        });
        return;
      }
      if (errorUploading.isUploadingError) {
        res.send({
          data: {
            error: 1,
            message: "Upload images errors",
          },
        });
      } else if (blogModel) {
        inserBlogToDb(blogModel, res);
      }
    });
  });
}

function inserBlogToDb(blogModel, res) {
  const blogData = {
    ...JSON.parse(JSON.stringify(blogModel)),
  };
  const insertBlog = () => {
    db.get()
      .collection("blog")
      .insertOne(blogModel)
      .then((dataSection) => {
        res.send({
          data: {
            error: 0,
            message: "Added successfully",
            blog: blogModel,
          },
        });
      });
  };

  if (!blogModel.blogId) {
    return insertBlog();
  }

  const blogId = new ObjectId(blogModel.blogId);
  try {
    db.get()
      .collection("blog")
      .findOne(
        {
          _id: blogId,
        },
        async function (err, blog) {
          if (!blog) {
            // create new section
            insertBlog();
          } else {
            delete blogData._id;
            const result = await db.get().collection("blog").updateOne(
              {
                _id: blogId,
              },
              {
                $set: blogData,
              },
              { upsert: true }
            );
            if (result.matchedCount === 1) {
              res.send({
                data: {
                  error: 0,
                  message: "Updated successfully",
                  blog: blogData,
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
  } catch (error) {
    res.send({
      error: 1,
      message: error.message,
    });
  }
}

function getBlogs(req, res) {
  const section = req.query.section;
  const origin = req.query.origin;

  const offset = Number(req.query.offset || 0);
  const limit = Number(req.query.limit || 10);

  if (!section || !origin) {
    res.send({
      data: {
        error: 1,
        message: "Please provide section and origin",
      },
    });
    return;
  }
  db.get()
    .collection("blog")
    .find(
      {
        section,
        origin,
      },
      {
        skip: offset,
        limit,
      }
    )
    .toArray(function (err, blogs) {
      if (err) {
        res.send({
          data: {
            error: 1,
            message: "Get blogs error",
          },
        });
        return;
      }
      let currentOffset = offset;
      if (blogs && blogs.length && blogs.length === limit) {
        currentOffset += limit;
      } else {
        currentOffset = -1;
      }
      const blogsConverted = blogs.reduce((result, item) => {
        result.push({
          ...item,
          price:
            item.price && typeof item.price === "string"
              ? JSON.parse(item.price)
              : item.price,
          shopConnection:
            item.shopConnection && typeof item.shopConnection === "string"
              ? JSON.parse(item.shopConnection)
              : undefined,
        });
        return result;
      }, []);
      return res.send({
        data: {
          error: 0,
          blogs: blogsConverted,
          offset: currentOffset,
        },
      });
    });
}

function getBlogById(req, res) {
  const blogId = new ObjectId(req.params.blogId);
  if (!blogId) {
    res.send({
      data: {
        error: 1,
        message: "Please provide blogId",
      },
    });
    return;
  }

  db.get()
    .collection("blog")
    .findOne(
      {
        _id: blogId,
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

async function removeBlog(req, res) {
  const blogId = req.params.blogId;
  if (blogId) {
    await db
      .get()
      .collection("blog")
      .deleteOne({ _id: ObjectId(blogId) }, true);
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
      message: "No product corresponding",
    },
  });
}

module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
  removeBlog,
};
