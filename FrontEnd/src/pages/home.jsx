import { useEffect, useState } from "react";
import TablaActivos from "../Components/TablaActivos";
import FormularioRegistroActivos from "../Components/FormularioRegistroActivos";
import axios from "axios";
import { parseJwt } from "../MAIN/Main";
import ExcelReader from "../Components/ExcelReader";
import { useRef } from "react";
import MantenimientosPrincipal from "../Components/MantenimientosPrincipal";
import ReportesGestion from "../Components/ReportesGestion";

const Home = () => {
  const [vistaActual, setVistaActual] = useState("mantenimientos"); // Estado para manejar la vista actual

  const [mostrarFormulario, setMostrarFormulario] = useState(false); // Estado para mostrar el formulario
  const [activos, setActivos] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 6; // Número de elementos por página
  const [username, setUsername] = useState("");
  const [rol, setRol] = useState("");
  const [activoSeleccionado, setActivoSeleccionado] = useState(null); // Activo seleccionado para editar
  const [esEdicion, setEsEdicion] = useState(false); // Bandera para el modo edición o creación
  const [terminoBusqueda, setTerminoBusqueda] = useState(""); // Término de búsqueda

  // Filtrar activos dinámicamente
  const activosFiltrados = activos.filter((activo) =>
    activo.numero_serie.toLowerCase().includes(terminoBusqueda.toLowerCase())
  );

  const cambiarAVista = (vista) => {
    setVistaActual(vista); // Cambia la vista actual
  };
  const fetchActivos = async () => {
    try {
      const response = await axios.get("http://localhost:5000/activos");
      console.log("Datos obtenidos:", response.data);
      setActivos(response.data); // Actualizar la tabla con los datos más recientes
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };
  useEffect(() => {
    fetchActivos();
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = parseJwt(token);
      if (decodedToken && decodedToken.username) {
        setUsername(decodedToken.username);
        setRol(decodedToken.rol);
      } else {
        console.log("no username");
      }
    } else {
      console.log("no token");
    }
  }, []);

  const CerrarSesion = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  // Calcular activos a mostrar según la página actual
  const indiceInicial = (paginaActual - 1) * elementosPorPagina;
  const indiceFinal = indiceInicial + elementosPorPagina;
  const activosPaginados = activosFiltrados.slice(indiceInicial, indiceFinal);

  // Total de páginas basado en activos filtrados
  const totalPaginas = Math.ceil(activosFiltrados.length / elementosPorPagina);

  const handlePaginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const handlePaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  // Función para manejar el clic en "Registro Individual"
  const handleRegistroIndividual = () => {
    setEsEdicion(false); // No es edición
    setActivoSeleccionado(null); // Limpiar activo seleccionado
    setMostrarFormulario(true); // Mostrar el modal
  };

  const handleEditarActivo = (activo) => {
    setEsEdicion(true); // Activar modo edición
    setActivoSeleccionado(activo); // Cargar el activo seleccionado
    setMostrarFormulario(true); // Mostrar el modal
  };

  // Función para cerrar el modal
  const handleCerrarModal = () => {
    setMostrarFormulario(false); // Oculta el formulario de registro
  };

  // Función para agregar un nuevo activo a la tabla
  const agregarActivo = (nuevoActivo) => {
    console.log("Nuevo activo:", nuevoActivo);

    // Aquí realizamos una solicitud GET para obtener los activos más recientes
    // para asegurarnos de que los datos estén actualizados
    axios
      .get("http://localhost:5000/activos")
      .then((response) => {
        setActivos(response.data); // Actualizar el estado con los activos más recientes
      })
      .catch((error) => {
        console.error("Error al obtener los datos actualizados:", error);
      });
  };
  const excelReaderRef = useRef();

  const handleButtonClick = () => {
    if (excelReaderRef.current) {
      excelReaderRef.current.triggerFileUpload();
    }
  };
  const actualizarActivo = (activoActualizado) => {
    setActivos((prevActivos) =>
      prevActivos.map((activo) =>
        activo.id_activo === activoActualizado.id_activo
          ? activoActualizado
          : activo
      )
    );
  };
  return (
    <>
      {/* Encabezado */}
      <div
        style={{
          backgroundColor: "rgb(163, 33, 38)",
          color: "white",
          height: "100px",
          padding: "10px 20px",
        }}
        className="d-flex justify-content-between align-items-center"
      >
        <div className="d-flex align-items-center gap-3">
          {/* Botón Mantenimientos */}
          <button
            className="btn"
            onClick={() => cambiarAVista("mantenimientos")}
            style={{
              backgroundColor:
                vistaActual === "mantenimientos" ? "white" : "white",
              color: vistaActual === "mantenimientos" ? "black" : "black",
              borderRadius: "35px",
              fontSize: "20px",
              padding: "10px 20px",
              fontWeight: vistaActual === "mantenimientos" ? "bold" : "normal",
            }}
          >
            Mantenimientos
          </button>
          {/* Botón Inicio */}
          <button
            className="btn"
            onClick={() => cambiarAVista("inicio")}
            style={{
              backgroundColor: vistaActual === "inicio" ? "white" : "white",
              color: vistaActual === "inicio" ? "black" : "black",
              borderRadius: "35px",
              fontSize: "20px",
              padding: "10px 20px",
              fontWeight: vistaActual === "inicio" ? "bold" : "normal",
            }}
          >
            Activos
          </button>

          {/* Botón Reportes de Gestión */}
          <button
            className="btn"
            onClick={() => cambiarAVista("reportesGestion")}
            style={{
              backgroundColor:
                vistaActual === "reportesGestion" ? "white" : "white",
              color: vistaActual === "reportesGestion" ? "black" : "black",
              borderRadius: "35px",
              fontSize: "20px",
              padding: "10px 20px",
              fontWeight: vistaActual === "reportesGestion" ? "bold" : "normal",
              cursor: rol === "admin" ? "pointer" : "not-allowed",
              opacity: rol === "admin" ? 1 : 0.6,
              pointerEvents: rol === "admin" ? "auto" : "none",
            }}
            disabled={rol !== "admin"} // Deshabilitado si no es admin
          >
            Reportes de Gestión
          </button>
        </div>

        {/* Botón Cerrar Sesión */}
        <div className="d-flex align-items-center">
          <button
            className="btn text-white d-flex align-items-center"
            onClick={CerrarSesion}
          >
            <img
              src="/SESION CERR.png"
              alt="Cerrar Sesión"
              style={{ width: "40px", height: "40px", marginRight: "8px" }}
            />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mt-3 mb-3">
        {" "}
        {/* Reducir márgenes */}
        {vistaActual === "inicio" && (
          <>
            <h1 className="mb-3" style={{ fontSize: "24px" }}>
              Bienvenido {username}
            </h1>

            <div className="mb-3 d-flex gap-2">
              {" "}
              {/* Reducir espacio entre botones */}
              <button
                className="btn"
                style={{ backgroundColor: "rgb(163, 33, 38)", color: "white", borderRadius:"20px", padding:"10px 20px"}}
                onClick={handleRegistroIndividual}
              >
                Registro Individual
              </button>
              <button
                className="btn"
                style={{ backgroundColor: "rgb(163, 33, 38)", color: "white",borderRadius:"20px", padding:"10px 20px" }}
                onClick={handleButtonClick}
              >
                Registro por Lotes
              </button>
              <ExcelReader ref={excelReaderRef} />
            </div>
            <div
              className="d-flex align-items-center mb-3"
              style={{ position: "relative", width: "220px" }} // Reducir ancho del campo de búsqueda
            >
              <input
                type="text"
                placeholder="Buscar Por Código"
                style={{
                  border: "4px solid #a32126", // Reducir grosor del borde
                  borderRadius: "15px", // Reducir bordes redondeados
                  padding: "5px 15px", // Reducir padding
                  width: "220px", // Reducir ancho
                }}
                value={terminoBusqueda}
                onChange={(e) => {
                  setTerminoBusqueda(e.target.value);
                  setPaginaActual(1); // Reiniciar a la primera página al buscar
                }}
                maxLength={20}
              />
              <button
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <img
                  src="/lupa-de-busqueda.png"
                  alt="Buscar"
                  style={{ width: "18px", height: "18px" }} // Reducir tamaño del icono
                />
              </button>
            </div>

            {/* Modal para mostrar el formulario */}
            {mostrarFormulario && (
              <div
                className="modal fade show"
                style={{ display: "block" }}
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
              >
                <div
                  className="modal-dialog"
                  style={{ maxWidth: "500px" }} // Reducir ancho del modal
                >
                  <div className="modal-content">
                    <div className="modal-body">
                      <FormularioRegistroActivos
                        closeModal={handleCerrarModal}
                        agregarActivo={agregarActivo}
                        activoTabla={activoSeleccionado} // Pasamos el activo seleccionado (si existe)
                        esEdicion={esEdicion} // Pasamos el estado del modo
                        actualizarActivo={actualizarActivo}
                        recargarTabla={fetchActivos} // Pasa la función para recargar la tabla
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabla de activos */}
            <TablaActivos
              activos={activosPaginados}
              onEdit={handleEditarActivo}
            />

            {/* Controles de paginación */}
            <div
              className="d-flex justify-content-between mt-3"
              style={{ gap: "15px" }} // Reducir espacio entre botones
            >
              <button
                className="btn"
                style={{ backgroundColor: "rgb(163, 33, 38)", color: "white" }}
                onClick={handlePaginaAnterior}
                disabled={paginaActual === 1}
              >
                Anterior
              </button>
              <button
                className="btn"
                style={{ backgroundColor: "rgb(163, 33, 38)", color: "white" }}
                onClick={handlePaginaSiguiente}
                disabled={paginaActual === totalPaginas}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
        {vistaActual === "mantenimientos" && <MantenimientosPrincipal />}
        {vistaActual === "reportesGestion" && <ReportesGestion />}
      </div>
    </>
  );
};

export default Home;
