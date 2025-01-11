import { useEffect, useState } from "react";
import TablaActivos from "../Components/TablaActivos";
import FormularioRegistroActivos from "../Components/FormularioRegistroActivos";
import axios from "axios";
import { parseJwt } from "../MAIN/Main";
import ExcelReader from "../Components/ExcelReader";
import { useRef } from "react";
import MantenimientosPrincipal from "../Components/MantenimientosPrincipal";

const Home = () => {
  const [vistaActual, setVistaActual] = useState("inicio"); // Estado para manejar la vista actual

  const [mostrarFormulario, setMostrarFormulario] = useState(false); // Estado para mostrar el formulario
  const [activos, setActivos] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 7; // Número de elementos por página
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
      <div
        style={{
          backgroundColor: "rgb(163, 33, 38)",
          color: "white",
          height: "100px",
        }}
        className="d-flex justify-content-between align-items-center px-4 py-2"
      >
      <div className="d-flex align-items-center gap-3">
        {/* Botón Activos/Mantenimientos */}
        <button
          onClick={() =>
            vistaActual === "inicio"
              ? cambiarAVista("mantenimientos")
              : cambiarAVista("inicio")
          }
          className="btn"
          style={{
            backgroundColor:
              rol === "admin"
                ? "white"
                : rol === "laboratorista"
                ? "white"
                : "black",
            color:
              rol === "admin" || rol === "laboratorista" ? "black" : "white",
            borderRadius: "35px",
            fontSize: "20px",
            padding: "10px 20px",
            fontWeight: "bold",
          }}
        >
          {vistaActual === "inicio" ? "Mantenimientos" : "Activos"}
        </button>

        {/* Botón Reportes de Gestión */}
        {vistaActual === "mantenimientos" && (
          <button
            className="btn"
            style={{
              backgroundColor:
                rol === "admin"
                  ? "white"
                  : rol === "laboratorista"
                  ? "white"
                  : "black",
              color:
                rol === "admin" || rol === "laboratorista" ? "black" : "white",
              borderRadius: "35px",
              fontSize: "20px",
              padding: "10px 20px",
              fontWeight: "bold",
              cursor: rol === "admin" ? "pointer" : "not-allowed",
              opacity: rol === "admin" ? 1 : 0.6,
              pointerEvents: rol === "admin" ? "auto" : "none", // Deshabilita interacción
            }}
            onClick={() => {
              if (rol === "admin") {
                console.log("Generando Reportes de Gestión");
              }
            }}
            disabled={rol !== "admin"} // Deshabilitado si no es admin
          >
            Reportes de Gestión
          </button>
        )}
      </div>
        <div className="d-flex align-items-center">
          <button
            className="btn text-white d-flex align-items-center"
            onClick={CerrarSesion}
          >
            <img
              src="/SESION CERR.png"
              alt="Cerrar Sesión"
              style={{ width: "50px", height: "50px", marginRight: "8px" }}
            />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mt-4 mb-4">
        {vistaActual === "inicio" && (
          <>
            <h1 className="mb-4">Bienvenido {username}</h1>

            <div className="mb-3 d-flex gap-3">
              <button
                className="btn"
                style={{ backgroundColor: "rgb(163, 33, 38)", color: "white" }}
                onClick={handleRegistroIndividual}
              >
                Registro Individual
              </button>
              <button
                className="btn"
                style={{ backgroundColor: "rgb(163, 33, 38)", color: "white" }}
                onClick={handleButtonClick}
              >
                Registro por Lotes
              </button>
              <ExcelReader ref={excelReaderRef} />
            </div>
            <div
              className="d-flex align-items-center mb-4"
              style={{ position: "relative", width: "250px" }}
            >
              <input
                type="text"
                placeholder="Buscar Por Código"
                style={{
                  border: "5px solid #a32126",
                  borderRadius: "20px",
                  padding: "5px 25px",
                  width: "250px",
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
                  style={{ width: "20px", height: "20px" }}
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
                  style={{ maxWidth: "600px", maxHeight: "500px" }}
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
              className="d-flex justify-content-between mt-4"
              style={{ gap: "20px" }}
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
      </div>
    </>
  );
};

export default Home;
