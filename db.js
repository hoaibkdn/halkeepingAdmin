const { MongoClient } = require("mongodb");
const url =
  "mongodb+srv://hoaitruong:UtCung13@cluster0.mevlx.mongodb.net/halkeeping?retryWrites=true&w=majority";
// "mongodb+srv://halkeeping:Hnh1234@cluster0.qmus1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
// const url = 'mongodb+srv://halStorm:UtCung13@cluster0.k4irp.mongodb.net/halgroup?retryWrites=true&w=majority'
const client = new MongoClient(
  url,
  { useUnifiedTopology: true },
  { useNewUrlParser: true },
  { connectTimeoutMS: 30000 },
  { keepAlive: 1 }
);
let mongodb;

async function connect(callback) {
  //   mongoClient.connect(mongoDbUrl, (err, db) => {
  //     mongodb = db;
  //     console.log("mongodb ===> ", mongodb);
  //   });
  try {
    const connected = await client.connect();
    if (url.includes("halkeeping")) {
      mongodb = connected.db("halkeeping");
    } else {
      mongodb = connected.db("halgroup");
    }

    console.log("Connected correctly to server");
    callback();
  } catch (err) {
    console.log(err.stack);
  }
  //   finally {
  //     await client.close();
  //   }
}
function get() {
  return mongodb;
}

function close() {
  client.close();
}

module.exports = {
  connect,
  get,
  close,
};
