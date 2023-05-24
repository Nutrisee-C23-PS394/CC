const mysql = require('mysql');
const util = require('util');

const db = mysql.createConnection({
  host: 'ip database',
  user: 'user database',
  password: 'password database',
  database: 'database',
});

db.query = util.promisify(db.query).bind(db);

db.connect((err) => {
  if (err) {
    throw err;
  }
});

module.exports = db;
