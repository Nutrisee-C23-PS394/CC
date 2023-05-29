const mysql = require('mysql');
const util = require('util');

const db = mysql.createConnection({
  host: 'ip database',
  user: 'user database',
  password: 'password database',
  database: 'database name',
});

db.beginTransaction = util.promisify(db.beginTransaction).bind(db);
db.query = util.promisify(db.query).bind(db);
db.commit = util.promisify(db.commit).bind(db);
db.rollback = util.promisify(db.rollback).bind(db);

db.connect((err) => {
  if (err) {
    throw err;
  }
});

module.exports = db;
