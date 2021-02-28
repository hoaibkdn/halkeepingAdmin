/** @format */

const { MongoClient } = require('mongodb');
// const config = require('./config');
const Users = require('./controllers/AuthController');
// const conf = config.get('mongodb');

class MongoBot {
  constructor() {
    const url = `mongodb+srv://hoaitruong:UtCung13@cluster0.mevlx.mongodb.net/halkeeping?retryWrites=true&w=majority`;
    this.client = new MongoClient(url);
  }
  async init() {
    await this.client.connect();
    console.log('connected');

    this.db = this.client.db('halkeeping');
    this.Users = new Users(this.db);
  }
}

module.exports = new MongoBot();
