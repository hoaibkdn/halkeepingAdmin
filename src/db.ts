import { Db, MongoClient } from "mongodb";

const url =
  "mongodb+srv://hoaitruong:UtCung13@cluster0.mevlx.mongodb.net/halkeeping?retryWrites=true&w=majority";
// "mongodb+srv://halkeeping:Hnh1234@cluster0.qmus1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
// const url = 'mongodb+srv://halStorm:UtCung13@cluster0.k4irp.mongodb.net/halgroup?retryWrites=true&w=majority'
const client = new MongoClient(
  url,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    connectTimeoutMS: 30000
  }
);

let mongodb: Db;

async function connect(callback: any) {
  try {
    const connected = await client.connect();
    if (url.includes("halkeeping")) {
      mongodb = connected.db("halkeeping");
    } else {
      mongodb = connected.db("halgroup");
    }

    console.log("=== !Connected correctly to server ====");
    callback();
  } catch (err: any) {
    console.log("==== ERROR contect server:", err.stack, "====");
  }
}

function getDB() {
  return mongodb;
}

function close() {
  client.close();
}

export {
  connect,
  getDB,
  close,
};
