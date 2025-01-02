const express = require('express');
const router = express.Router();
const { ping } = require('../controllers/pingController.js');
const { login } = require('../controllers/loginController.js');
const { getActivos } = require('../controllers/home.Controlers.js');
const { getLaboratoristas } = require('../controllers/laboratoristasControllers.js');
const { getProveedores } = require('../controllers/proveedoresController.js');
const { getLaboratoriosPorBloque } = require('../controllers/laboratoriosPorBloqueController.js');
const { registrarActivos } = require('../controllers/registrarActivosController.js');
const { getEdificios } = require('../controllers/edificiosController.js');
const { loteController } = require('../controllers/loteController.js');
const { getActivosDisponibles } = require('../controllers/activosController');
const { crearMantenimiento } = require('../controllers/crearMantenimiento');
const { empresas_mantenimientos } = require('../controllers/empresas_mantenimientos.js');
const { getTipoActivos } = require('../controllers/tipoActivoController.js');
const { getMarcasPorActivo } = require('../controllers/marcasController.js');
const { getModelosPorMarca } = require('../controllers/modelosController.js');
const { actualizarActivos } = require('../controllers/editarActivosController.js');
const { getMantenimientos } = require("../controllers/mantenimientoControllers");
const { guardarActivos } = require("../controllers/guardar_activos.js");
const { activosporMantenimiento } = require("../controllers/activosporMantenimiento");
const { finalizarMantenimiento } = require("../controllers/finalizarMantenimiento");
const { insertarActividad } = require("../controllers/insertarActividad");
const { consultarActividades } = require("../controllers/consultarActividades");

const { consultarMantenimiento } = require("../controllers/consultarMantenimiento");
const {getComponentes} = require('../controllers/componentesController.js');
const { componentesActuales } = require("../controllers/componentesActuales");
const { guardarcomponentes } = require("../controllers/guardarcomponentes");
const { actividadesPorMantenimiento } = require("../controllers/actividadesPorMantenimiento");

const { finalizarmantenimientototal } = require("../controllers/finalizarmantenimientototal");
router.get('/activos', getActivos);
router.get('/ping', ping);
router.post('/login', login);
router.get('/laboratoristas', getLaboratoristas);
router.get('/proveedores', getProveedores);
router.get('/edificios', getEdificios);
router.get('/laboratorios/:idEdificio', getLaboratoriosPorBloque);
router.post('/registrarActivos', registrarActivos);
router.get('/activos-disponibles', getActivosDisponibles);
router.post('/crear-mantenimiento', crearMantenimiento);
router.get('/empresas_mantenimientos', empresas_mantenimientos);
router.get('/tiposActivos', getTipoActivos);
router.get('/marcas/:idActivo', getMarcasPorActivo);
router.get('/modelos/:idMarca', getModelosPorMarca);
router.post('/registrarLoteActivos', loteController);
router.put('/actualizarActivo/:id_activo', actualizarActivos);
router.get('/mantenimientos', getMantenimientos);
router.post('/activosporMantenimiento', activosporMantenimiento);
router.post('/guardar_activos', guardarActivos);
router.post('/finalizarMantenimiento', finalizarMantenimiento);
router.post('/finalizarmantenimientototal', finalizarmantenimientototal);
router.post('/insertarActividad', insertarActividad);
router.get('/consultarActividades', consultarActividades);
router.post('/consultarMantenimiento', consultarMantenimiento);
router.post('/componentesActuales', componentesActuales);
router.post('/guardarcomponentes', guardarcomponentes);
router.post('/actividadesPorMantenimiento', actividadesPorMantenimiento);


router.get('/componentes', getComponentes);

module.exports = router; 