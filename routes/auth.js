/** @format */

const express = require("express");
const router = express.Router();
const db = require("./../db");
const AuthController = require("./../controllers/AuthController");
const ImageController = require("./../controllers/ImageController");
router.post("/register", AuthController.register);
router.get("/users", (req, res) => {
  console.log("req with token ", req.user);
  db.get()
    .collection("users")
    .find({})
    .toArray()
    .then((items) => {
      items.forEach(console.log);
      res.send(items);
      return items;
    })
    .catch((err) => console.error(`Failed to find documents: ${err}`));
});
router.post("/login", AuthController.login);
router.patch("/user/:userId", AuthController.updateUser);

router.post("/upload", ImageController.uploadFile);
router.get("/get-images", ImageController.getImages);

module.exports = router;
