import { useEffect, useState } from "react";
import TablaActivos from "../Components/TablaActivos";
import FormularioRegistroActivos from "../Components/FormularioRegistroActivos";
import axios from "axios";
import { parseJwt } from "../MAIN/Main";
const Home = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false); // Estado para mostrar el formulario
  const [activos, setActivos] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 7; // Número de elementos por página
  const [username, setUsername] = useState("");
  const [rol, setRol] = useState("");
  useEffect(() => {
    const fetchActivos = async () => {
      try {
        const response = await axios.get("http://localhost:5000/activos"); // Ajusta la URL según tu configuración
        setActivos(response.data);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
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
  /*
    const handleActualizar = (activo) => {
        console.log("Actualizar activo:", activo);
        // Agrega tu lógica para actualizar el activo aquí
    };*/
  const CerrarSesion = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  /*
  const handleActualizar = (activo) => {
    console.log("Actualizar activo:", activo);
    // Agrega tu lógica para actualizar el activo aquí
  };*/

  const indiceInicial = (paginaActual - 1) * elementosPorPagina;
  const indiceFinal = indiceInicial + elementosPorPagina;
  const activosPaginados = activos.slice(indiceInicial, indiceFinal);

  const totalPaginas = Math.ceil(activos.length / elementosPorPagina);

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
    setMostrarFormulario(true); // Muestra el formulario de registro
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

  return (
    <>
      {/* Cabecera */}
      <div
        style={{
          backgroundColor: "rgb(163, 33, 38)",
          color: "white",
          height: "100px",
        }}
        className="d-flex justify-content-between align-items-center px-4 py-2"
      >
        <div className="d-flex align-items-center">
          <button
            className="btn"
            style={{
              backgroundColor: rol === "admin" ? "white" : "gray", // Color gris para laboratorista
              color: rol === "admin" ? "black" : "white", // Texto gris si es laboratorista
              cursor: rol === "admin" ? "pointer" : "not-allowed",
              borderRadius: "35px",
              fontSize: "20px",
              padding: "10px 20px",
              fontWeight: "bold",
              whiteSpace: "nowrap", // Cursor para indicar deshabilitado
            }}
            disabled={rol !== "admin"} // Desactivar el botón si no es admin
          >
            Mantenimientos
          </button>
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
      <div className="container mt-4">
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
          >
            Registro por Lotes
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
                    agregarActivo={agregarActivo} // Pasamos la función para agregar el activo
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de activos */}
        <TablaActivos activos={activosPaginados} />

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
      </div>
    </>
  );
};

export default Home;
