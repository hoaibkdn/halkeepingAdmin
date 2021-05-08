/** @format */

const User = require("./../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./../db");
var ObjectId = require("mongodb").ObjectID;

const generateWebId = (email) => {
  const firstPartEmail = email.split("@")[0];
  return firstPartEmail + Math.random();
};
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
  // find existing email, if it's existing, return an error
  db.get()
    .collection("users")
    .findOne({
      $or: [
        {
          username: req.body.username,
        },
        { email: req.body.email },
      ],
    })
    .then((item) => {
      console.log("item !!! ===> ", item);
      if (item) {
        res.send({
          data: {
            error: 1,
            message: "Username or email is used",
          },
        });
        return;
      }
      if (!req.body.username || !req.body.password || !req.body.email) {
        res.send({
          data: {
            error: 1,
            message: "Username or email or password is not null",
          },
        });
        return;
      }
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
        try {
          db.get()
            .collection("users")
            .insertOne(user)
            .then(() => {
              res.send({
                data: {
                  error: 0,
                  message: "Register successfully",
                },
              });
            });
        } catch (error) {
          console.log(error);
        }
      });
    });
};

function login(req, res, next) {
  db.get()
    .collection("users")
    .findOne(
      {
        email: req.body.email,
      },
      function (err, user) {
        console.log("user ===> ", user);
        if (err) throw err;
        if (!user || !bcrypt.compare(req.body.password, user.password)) {
          return res.status(401).json({
            message: "Authentication failed. Invalid user or password.",
          });
        }
        return res.json({
          data: {
            error: 0,
            token: jwt.sign(
              { email: user.email, fullName: user.fullName, _id: user._id },
              "RESTFULAPIs"
            ),
          },
        });
      }
    );
}

async function updateUser(req, res, next) {
  const updatedData = { ...req.body };
  if (req.body.email) {
    db.get()
      .collection("users")
      .findOne(
        {
          email: req.body.email,
        },
        function (err, user) {
          if (user) {
            return res.json({
              data: {
                error: 1,
                message: "The email is used. Please use another email",
              },
            });
          } else {
            updatedData.email = req.body.email;
          }
        }
      );
  }
  if (req.body.password) {
    bcrypt.hash(req.body.password, 10, function (err, hashedPass) {
      if (err) {
        res.json({
          error: err,
        });
      }
      updatedData.password = hashedPass;
    });
  }
  const result = await db
    .get()
    .collection("users")
    .updateOne(
      {
        _id: new ObjectId(req.params.userId),
      },
      {
        $set: updatedData,
      },
      { upsert: true }
    );
  if (result.matchedCount === 1) {
    res.send({
      data: {
        error: 0,
        message: "Updated successfully",
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

module.exports = {
  register,
  login,
  updateUser,
};
