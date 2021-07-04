// create a product
const db = require("../db");
const sectionController = require("./SectionController");
const utils = require("./../utils");
const ObjectId = require("mongodb").ObjectID;
const multiparty = require("multiparty");
const Product = require("./../models/Product");

function creatProduct(req, res) {
  let form = new multiparty.Form();
  let convertedData = {
    title: "",
    description: "",
    images: [],
    data: [],
    origin: "",
    category: "",
    price: {
      min: 0,
      max: 0,
    },
    shopConnection: {
      shopee: "",
      lazada: "",
      sendo: "",
      tiki: "",
    },
  };
  let s3Params = { 0: [] };
  let errorUploading = {
    isUploadingError: false,
  };

  let productModel = null;
  form.parse(req, async function (err, fields, files) {
    if (fields) {
      convertedData = sectionController.convertDataSection(fields);
      productModel = new Product({
        title: convertedData.title,
        description: convertedData.description,
        images: convertedData.images,
        origin: convertedData.origin,
        categoryId: new ObjectId(convertedData.categoryId),
        price: JSON.stringify({
          min: convertedData.minPrice || 0,
          max: convertedData.maxPrice || 0,
        }),
        shopConnection: JSON.stringify({
          shopee: convertedData.shopee,
          lazada: convertedData.lazada,
          sendo: convertedData.sendo,
          tiki: convertedData.tiki,
        }),
        productId: new ObjectId(convertedData.id),
        tag: convertedData.tag,
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
      utils.mapS3ImageToConvertedData(values, s3Params, productModel);

      // Save data to db
      if (!productModel) {
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
      } else if (productModel) {
        inserProductToDb(productModel, res);
      }
    });
  });
}

function inserProductToDb(convertedData, res) {
  const productData = {
    ...JSON.parse(JSON.stringify(convertedData)),
    price: JSON.parse(convertedData.price),
    shopConnection: JSON.parse(convertedData.shopConnection),
    categoryId: new ObjectId(convertedData.categoryId),
    productId: new ObjectId(convertedData.productId),
  };
  const insertProduct = () => {
    db.get()
      .collection("product")
      .insertOne(convertedData)
      .then(() => {
        res.send({
          data: {
            error: 0,
            message: "Added successfully",
            product: productData,
          },
        });
      });
  };
  if (!productData.productId) {
    return insertProduct();
  }
  try {
    const productId = productData.productId;
    db.get()
      .collection("product")
      .findOne(
        {
          _id: productId,
        },
        async function (err, product) {
          if (!product) {
            // create new product
            insertProduct();
          } else {
            delete productData._id;
            const result = await db.get().collection("product").updateOne(
              {
                _id: productId,
              },
              {
                $set: productData,
              },
              { upsert: true }
            );
            if (result.matchedCount === 1) {
              res.send({
                data: {
                  error: 0,
                  message: "Updated successfully",
                  product: productData,
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
    console.log(error);
  }
}

async function getProducts(req, res) {
  const categoryId = req.query.categoryId
    ? new ObjectId(req.query.categoryId)
    : undefined;
  const domainName = req.query.origin;
  const offset = Number(req.query.offset || 0);
  const limit = Number(req.query.limit || 10);
  const search = req.query.search || "";
  const regexSearch = new RegExp("^" + search, "i");
  if (!domainName && !search) {
    res.send({
      data: {
        error: 1,
        message: "Please provide category and domain",
      },
    });
    return;
  }
  const matchProductQuery = {
    categoryId,
    origin: domainName,
  };
  if (!categoryId) {
    delete matchProductQuery.categoryId;
  }
  if (!domainName) {
    delete matchProductQuery.origin;
  }

  db.get()
    .collection("product")
    .aggregate([
      {
        $match: {
          $or: [
            {
              ...matchProductQuery,
              title: { $in: [regexSearch] },
            },
            {
              ...matchProductQuery,
              description: { $in: [regexSearch] },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "category",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $skip: offset,
      },
      {
        $limit: limit,
      },
      { $sort: { updatedAt: -1 } },
    ])
    .toArray(async function (err, products) {
      if (err) {
        res.send({
          data: {
            error: 1,
            message: "Get products error",
          },
        });
        return;
      }
      let currentOffset = offset;
      if (products && products.length && products.length === limit) {
        currentOffset += limit;
      } else {
        currentOffset = -1;
      }
      let hasNext = currentOffset !== -1 ? true : false;
      if (currentOffset > 0) {
        hasNext = await db
          .get()
          .collection("product")
          .aggregate([
            {
              $match: matchProductQuery,
            },
            {
              $lookup: {
                from: "category",
                localField: "categoryId",
                foreignField: "_id",
                as: "category",
              },
            },
            {
              $skip: currentOffset,
            },
            {
              $limit: 1,
            },
          ])
          .hasNext();
      }

      const productsConverted = products.reduce((result, item) => {
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
          products: productsConverted,
          offset: hasNext ? currentOffset : -1,
        },
      });
    });
}

function getProductById(req, res) {
  const productId = new ObjectId(req.params.productId);

  if (!productId) {
    res.send({
      data: {
        error: 1,
        message: "Please provide productId",
      },
    });
    return;
  }

  db.get()
    .collection("product")
    .findOne(
      {
        _id: productId,
      },
      function (err, product) {
        if (err) {
          res.send({
            data: {
              error: 1,
              message: "Get the product error",
            },
          });
          return;
        }
        return res.send({
          data: {
            error: 0,
            message: "Get product successfully",
            product: {
              ...product,
              price:
                product.price && typeof product.price === "string"
                  ? JSON.parse(product.price)
                  : product.price,
              shopConnection:
                product.shopConnection &&
                typeof product.shopConnection === "string"
                  ? JSON.parse(product.shopConnection)
                  : product.shopConnection,
            },
          },
        });
      }
    );
}

async function removeProduct(req, res) {
  const productId = req.params.productId;
  if (productId) {
    await db
      .get()
      .collection("product")
      .deleteOne({ _id: ObjectId(productId) }, true);
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
  creatProduct,
  getProducts,
  getProductById,
  removeProduct,
};
