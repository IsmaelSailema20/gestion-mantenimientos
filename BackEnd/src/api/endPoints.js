const express = require('express');
const router =express.Router();
const {ping}=require('../controllers/pingController.js');
const {login}=require('../controllers/loginController.js');
const {getActivos} = require('../controllers/home.Controlers.js');
const {getLaboratoristas} = require('../controllers/laboratoristasControllers.js');
const {getProveedores} = require('../controllers/proveedoresController.js');
const {getLaboratoriosPorBloque} = require('../controllers/laboratoriosPorBloqueController.js');
const {registrarActivos} = require('../controllers/registrarActivosController.js');
const { getEdificios } = require('../controllers/edificiosController.js'); 
const { loteController } = require('../controllers/loteController.js'); 

router.get('/activos', getActivos);
router.get('/ping',ping);
router.post('/login',login);
router.get('/laboratoristas',getLaboratoristas);
router.get('/proveedores',getProveedores);
router.get('/edificios', getEdificios);
router.get('/laboratorios/:idEdificio', getLaboratoriosPorBloque);
router.post('/registrarActivos',registrarActivos);

router.post('/registrarLoteActivos',loteController);
module.exports =router; 