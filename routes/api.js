const express = require('express');
const { userInfo, storeUser } = require('../controller/userController');
const { historyFood, getHistoryFood, alergi } = require('../controller/foodController');
const { signUp, logIn, logOut } = require('../controller/userAuthController');
const verifyToken = require('../middleware/verifyToken');

const route = express.Router();

// API dari auth controller
route.post('/signup', signUp);
route.post('/login', logIn);
route.post('/logout', logOut);

// API dari user Controller
route.get('/profile', verifyToken, userInfo);
route.put('/update', verifyToken, storeUser);
// route.get('/testtoken', verifyToken, testHeaders);
// route.get('/session', verifyToken, testSession);

// API dari foodController
route.get('/allergy', alergi);
route.put('/history', verifyToken, historyFood);
route.get('/history', verifyToken, getHistoryFood);

module.exports = route;
