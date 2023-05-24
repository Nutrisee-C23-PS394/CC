const express = require('express');
const { login, signUp } = require('../controller/userController');

const route = express.Router();

route.post('/signup', signUp);
route.post('/login', login);

module.exports = route;
