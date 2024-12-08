const express = require('express');
const router =express.Router();
const {ping}=require('../controllers/pingController.js');
const {login}=require('../controllers/loginController.js');
const {getActivos} = require('../controllers/home.Controlers.js');

router.get('/activos', getActivos);
router.get('/ping',ping);
router.post('/login',login);
module.exports =router; 