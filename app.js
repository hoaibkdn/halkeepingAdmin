/** @format */

const { MongoClient } = require("mongodb");
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
const utils = require("./utils");
const db = require("./db");
// const url =
//   "mongodb+srv://hoaitruong:UtCung13@cluster0.mevlx.mongodb.net/halkeeping?retryWrites=true&w=majority";

// const client = new MongoClient(url);

app.use(bodyParser.json());

app.use(function (req, res, next) {
  // const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS, PUT");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", true);

  if (
    req.url === "/api/login" ||
    req.url === "/api/register" ||
    req.url.includes("api/sections") ||
    req.url.includes("api/product/get") ||
    req.url.includes("api/category/get") ||
    req.url.includes("api/blog/get")
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
        console.log("decode ===> ", decode);
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
// async function run() {
//   try {
//     const connected = await client.connect();
//
//     let mongodb = connected.db("halkeeping");
//     // const dbo = connected.db('halkeeping');
//     // dbo.createCollection('user', function (err, res) {
//     //   if (err) throw err;
//     //   console.log('Collection created!');
//     //   connected.close();
//     // });

//     console.log("Connected correctly to server");
//   } catch (err) {
//     console.log(err.stack);
//   } finally {
//     await client.close();
//   }
// }
// run().catch(console.dir);

// listen
// app.listen(3000);

// -------MARK & SWEEP ----------

// let HEAP = [];

// const A = {
//   languague: "Javascript",
// };
// HEAP.push(A);
// const root = () => HEAP[0];

// const B = {
//   languague: "Rust",
// };

// HEAP.push(B);
// A.B = B;
// const C = {
//   languague: "Elm",
// };

// HEAP.push(C);

// A.C = C;

// delete A.C;

// const D = {
//   languague: "Golang",
// };

// HEAP.push(D);
// B.D = D;

// const mark = () => {
//   let reachables = [root()];
//   while (reachables.length) {
//     let current = reachables.pop();
//     if (!current.__markBit__) {
//       current.__markBit__ = 1;

//       for (let i in current) {
//         if (typeof current[i] === "object") {
//           reachables.push(current[i]);
//         }
//       }
//     }
//   }
// };

// const sweep = () => {
//   HEAP = HEAP.filter((current) => {
//     if (current.__markBit__ === 1) {
//       current.__markBit__ === 0;
//       return true;
//     }
//     return false;
//   });
// };

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
    // console.log("HEAP state before ", HEAP);
    // mark();
    // sweep();
    // console.log("HEAP state after ", HEAP);
  });
});
// module.exports = {
//   client,
// };
