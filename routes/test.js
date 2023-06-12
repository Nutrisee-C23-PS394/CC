const express = require('express');
// const db = require('../config/database');
// const verifyToken = require('../middleware/verifyToken');

const route = express.Router();

route.get('/', (req, res) => {
  const { uid } = req.body;
  res.status(200).json({ status: 200, message: 'request success', id: uid });
});

module.exports = route;
