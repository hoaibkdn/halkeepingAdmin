/** @format */

const { MongoClient } = require('mongodb');
const path = require('path');
const express = require('express');
const app = express();

require('dotenv').config();
const bodyParser = require('body-parser');
const postsRoute = require('./routes/posts');
const authRoute = require('./routes/auth');
const url =
  'mongodb+srv://hoaitruong:UtCung13@cluster0.mevlx.mongodb.net/halkeeping?retryWrites=true&w=majority';

const client = new MongoClient(url);

app.use(bodyParser.json());

app.use('/posts', postsRoute);
// ROUTES
app.get('/', (req, res) => {
  res.send({
    id: 123123,
  });
});
app.get('/', (req, res) => {
  res.send('We posting');
});

async function run() {
  try {
    const connected = await client.connect();
    app.use('/api', authRoute);
    // const dbo = connected.db('halkeeping');
    // dbo.createCollection('user', function (err, res) {
    //   if (err) throw err;
    //   console.log('Collection created!');
    //   connected.close();
    // });

    console.log('Connected correctly to server');
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

// listen
app.listen(3000);
// module.exports = {
//   client,
// };
