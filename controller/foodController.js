const db = require('../config/database');

// mendapatkan semua list alergi yang ada di database
const alergi = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM alergi');
    res.status(200).json({ result });
  } catch (error) {
    res.status(400).json({ status: 404, message: 'Requested Data is Unavailable' });
  }
};

module.exports = alergi;
