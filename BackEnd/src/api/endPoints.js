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
const { getComponentes } = require('../controllers/componentesController.js');
const { componentesActuales } = require("../controllers/componentesActuales");
const { guardarcomponentes } = require("../controllers/guardarcomponentes");
const { actividadesPorMantenimiento } = require("../controllers/actividadesPorMantenimiento");
const { finalizarmantenimientototal } = require("../controllers/finalizarmantenimientototal");
const { getModelosInfo } = require('../controllers/modelosInfoController.js');
const { getActividades } = require("../controllers/FiltrosReportesControllers");
const { getEncargados } = require("../controllers/FiltrosReportesControllers");
const { getTiposMantenimientos } = require("../controllers/FiltrosReportesControllers");
const { getClases } = require("../controllers/FiltrosReportesControllers");

//RUTAS PARA FILTROS
const { ubicacionesParaFiltro } = require('../controllers/ubicacionesParaFiltro.js');
const { proveedoresParaFiltro } = require('../controllers/proveedoresParaFiltros.js');
const { claseParaFiltro } = require('../controllers/claseActivoParaFiltro.js');
const { actividadesRealizadas } = require('../controllers/actividadesRealizadas.js');
const { componentesSeleccionados } = require('../controllers/componentesSeleccionados.js');
const { actividadesPorActivo } = require('../controllers/actividadesPorActivo.js');

//COMPONENTES ACTIVOS
const { componentesActivos } = require("../controllers/componentesActivos");

//GRAFICOS
const { frecuenciaMantenimientos } = require("../controllers/Graficos/frecuencia_mantenimientos");
const { getTiposMantenimientosPorMes } = require("../controllers/Graficos/TipoMantenimientosPorMes");
const { mantenimientosPorAnio } = require("../controllers/Graficos/mantenimientosPorAnio");
const { encargadoMantenimientoAño } = require("../controllers/Graficos/encargadoMantenimientoAño");
const {obtenerMantenimientosPorFiltros} = require("../controllers/GraficosGestion/GraficoDatosFiltrados");
const {obtenerMantenimientosPorMes} = require("../controllers/GraficosGestion/obtenerMantenimientosPorMes");
const {obtenerMantenimientosPorClase} = require("../controllers/GraficosGestion/MantenimientosPorClase");
const {obtenerMantenimientosPorEncargado} = require("../controllers/GraficosGestion/MantenimientosPorEncargado");
const {obtenerActividadesMantenimiento} = require("../controllers/GraficosGestion/ActividadesPorMantenimiento");


const { eliminarActivoDeMantenimiento } = require("../controllers/eliminarActivoDeMantenimiento");

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
router.get('/modelos', getModelosPorMarca);
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
router.get('/modelos-info', getModelosInfo); // Necesario para registrar por lotes
router.get('/ubicaciones-filtro', ubicacionesParaFiltro); //FILTRO DE UBICACIONES
router.get('/proveedores-filtro', proveedoresParaFiltro); //FILTRO DE PROVEEDORES
router.get('/clase-filtro', claseParaFiltro); //FILTRO DE PROVEEDORES
router.post('/actividadesRealizadas', actividadesRealizadas);
router.post('/componentesSeleccionados', componentesSeleccionados);
router.post('/actividadesPorActivo', actividadesPorActivo);
router.post('/eliminarActivoDeMantenimiento', eliminarActivoDeMantenimiento);


router.get("/componentes/:id_activo", componentesActivos);

router.get('/actividades', getActividades);
router.get('/encargados', getEncargados);
router.get('/tiposMantenimientos', getTiposMantenimientos);
router.get('/clases', getClases);


//GRAFICOS
router.get("/frecuencia_mantenimientos/:id_activo", frecuenciaMantenimientos);
router.get("/tipos_mantenimientos_mes/:id_activo", getTiposMantenimientosPorMes);
router.get("/mantenimientos_por_anio/:id_activo", mantenimientosPorAnio);
router.get("/mantenimientos_empresa_laboratorista/:id_activo", encargadoMantenimientoAño)
router.post("/obtenerMantenimientosPorFiltros", obtenerMantenimientosPorFiltros);
router.post("/obtenerMantenimientosPorMes", obtenerMantenimientosPorMes);
router.post("/obtenerMantenimientosPorClase", obtenerMantenimientosPorClase);
router.post("/obtenerMantenimientosPorEncargado", obtenerMantenimientosPorEncargado);
router.post("/obtenerActividadesMantenimiento", obtenerActividadesMantenimiento);
module.exports = router;

