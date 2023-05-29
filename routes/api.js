const express = require('express');
const { login, signUp, userInfo, storeUser } = require('../controller/userController');
// const tokenVerify = require('../middleware/verifyToken');
const alergi = require('../controller/foodController');

const route = express.Router();

// API dari user controller
route.post('/signup', signUp);
route.post('/login', login);
route.get('/profile', userInfo);
route.put('/update', storeUser);

// API dari foodController
route.get('/allergy', alergi);

module.exports = route;
