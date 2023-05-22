const mysql = require('mysql');
const util = require('util');

const db = mysql.createConnection({
  host: 'url or ip host',
  user: 'user DB',
  password: 'insert Password',
  database: 'which database',
});

// db.query = util.promisify(db.query).bind(db);

db.connect((err) => {
  if (err) {
    throw err;
  }
});

module.exports = db;
