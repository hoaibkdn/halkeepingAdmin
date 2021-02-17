/** @format */

const User = require("./../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./../db");
// const mongoose = require("mongoose");
// const url =
//   "mongodb+srv://hoaitruong:UtCung13@cluster0.mevlx.mongodb.net/halkeeping?retryWrites=true&w=majority";

// mongoose.connect(url);

// class User {
//   constructor(db) {
//     this.collection = db.collection("users");
//   }
//   async addUser(user) {
//     const newUser = await this.collection.insertOne(user);
//     return newUser;
//   }
// }
// module.exports = User;

const register = (req, res, next) => {
  bcrypt.hash(req.body.password, 10, function (err, hashedPass) {
    if (err) {
      res.json({
        error: err,
      });
    }

    let user = new User({
      username: req.body.username,
      password: hashedPass,
      email: req.body.email,
      phone: req.body.phone,
      birthday: req.body.birthday,
    });
    console.log("user ====> ", user);
    console.log("db====> ", db);
    try {
      db.get().collection("users").insertOne(user);
    } catch (error) {
      console.log(error);
    }

    // const client = app.client;

    // const database = client.db('sample_mflix');
    // const collection = database.collection('movies');

    // console.log('client ', client);
    // console.log('database ', database);
    // console.log('collection ', collection);
    //   user
    //     .save()
    //     .then((user) => {
    //       res.json({
    //         message: "User added successfully",
    //       });
    //     })
    //     .catch((err) => {
    //       console.log("errr ===> ", err);
    //       res.json({
    //         message: "An error occured!",
    //       });
    //     });
  });
};

module.exports = {
  register,
};
