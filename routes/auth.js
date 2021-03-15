/** @format */

const express = require("express");
const router = express.Router();
const db = require("./../db");
const AuthController = require("./../controllers/AuthController");
// const utils = require("./utils");
router.post("/register", AuthController.register);
router.get("/users", (req, res) => {
  const query = { "reviews.0": { $exists: true } };
  const projection = { _id: "60239b04defa4b706935f5db" };
  console.log("req with token ", req.user);
  // if (!req.user) {
  //   res.send({
  //     data: utils.checkAuthorization(req),
  //   });
  //   return;
  // }
  db.get()
    .collection("users")
    .find({})
    .toArray()
    .then((items) => {
      // console.log(`Successfully found ${items.length} documents.`);
      items.forEach(console.log);
      res.send(items);
      return items;
    })
    .catch((err) => console.error(`Failed to find documents: ${err}`));
});
router.post("/login", AuthController.login);
router.patch("/user/:userId", AuthController.updateUser);
module.exports = router;
