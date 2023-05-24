const express = require('express');

const route = express.Router();

route.get('/', (req, res) => {
  res.status(200).json({ status: 200, message: 'request success' });
});

module.exports = route;
