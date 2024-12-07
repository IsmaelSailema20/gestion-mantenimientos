const express = require('express');
const router =express.Router();
const {ping}=require('../controllers/pingController.js');
const {login}=require('../controllers/loginController.js');


router.get('/ping',ping);
router.post('/login',login);
module.exports =router; 