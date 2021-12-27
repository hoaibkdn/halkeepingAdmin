/** @format */

const path = require("path");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

require("dotenv").config();
const bodyParser = require("body-parser");
const authRoute = require("./routes/auth");
const cleanerRoute = require("./routes/cleaner");
const customerRoute = require("./routes/customer");
const jobRoute = require("./routes/job");
const sectionRoute = require("./routes/section");
const productRoute = require("./routes/product");
const categoryRoute = require("./routes/category");
const blogRoute = require("./routes/blog");
const provinceRoute = require("./routes/province");
const utils = require("./utils");
const db = require("./db");

app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS, PUT");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", true);

  if (
    req.url === "/api/login" ||
    req.url === "/api/register" ||
    req.url.includes("api/sections/get-section") ||
    req.url.includes("api/sections/get-batch-sections") ||
    req.url.includes("api/product/get") ||
    req.url.includes("api/category/get") ||
    req.url.includes("api/blog/get") ||
    req.url.includes("api/product/search") ||
    req.url.includes("api/sections/send-checkin") ||
    req.url.includes("api/job/create") ||
    req.url.includes("api/provinces") ||
    req.url.includes("api/job/basic-info")
  ) {
    next();
    return;
  }
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    jwt.verify(
      req.headers.authorization.split(" ")[1],
      "RESTFULAPIs",
      function (err, decode) {
        if (err) req.user = undefined;
        req.user = decode;
        next();
      }
    );
  } else {
    req.user = undefined;
    utils.checkAuthorization(req, res);
    // next();
  }
});

db.connect(() => {
  app.listen(process.env.PORT || 3000, function () {
    app.use("/api", authRoute);
    app.use("/api/cleaner", cleanerRoute);
    app.use("/api/customer", customerRoute);
    app.use("/api/job", jobRoute);
    app.use("/api/sections", sectionRoute);
    app.use("/api/product", productRoute);
    app.use("/api/category", categoryRoute);
    app.use("/api/blog", blogRoute);
    app.use("/api/provinces", provinceRoute);
  });
});
