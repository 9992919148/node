const express = require('express');
const constoller = require('../controller/crud');
const route = express.Router();
route.get('/', constoller.index);
route.get('/login', constoller.login);
route.get('/register', constoller.showRegister);
route.post('/register', constoller.registerUser);
//route.get('/dashboard', constoller.index);   
module.exports = route;  