const express = require('express');
const router =express.Router();
const {ping}=require('../controllers/pingController.js');
const {login}=require('../controllers/loginController.js');
const {getActivos} = require('../controllers/home.Controlers.js');
const {getLaboratoristas} = require('../controllers/laboratoristasControllers.js');
const {getProveedores} = require('../controllers/proveedoresController.js');
const {getUbicaciones} = require('../controllers/ubicacionesController.js');


router.get('/activos', getActivos);
router.get('/ping',ping);
router.post('/login',login);
router.get('/laboratoristas',getLaboratoristas);
router.get('/proveedores',getProveedores);
router.get('/ubicaciones',getUbicaciones);
module.exports =router; 