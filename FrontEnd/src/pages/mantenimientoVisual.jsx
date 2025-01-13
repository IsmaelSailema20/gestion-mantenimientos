import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ListadoActivo from "../Components/listadoActivosDispo";
import AgregarActividad from "../Components/agregarActividad";
import SuccessModal from "../Components/SuccessModal";
import ErrorModal from "../Components/ErrorModal";
import { useNavigate } from "react-router-dom";
import ActividadesPorMantenimiento from "../Components/actMantenimiento"; // Ajusta la ruta según la ubicación real
import { useLocation } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ListaActividad from "../Components/detalleActMantenimiento";
import CuadroConf from "../Components/cuadroConfirmacion";
function MantenimientoVisual() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mantenimiento, setMantenimiento] = useState(
    location.state?.mantenimiento || JSON.parse( localStorage.getItem('mantenimiento'))
  );
  const [activoSeleccionado, setActivoSeleccionado] = useState(null);

  const [fechaInicio, setFechaInicio] = useState(mantenimiento?.inicio || "");
  const [fechaFin, setFechaFin] = useState(mantenimiento?.fin || "");
  const [tipo, setTipo] = useState(mantenimiento?.tipo || "preventivo");
  const [estado, setEstado] = useState(mantenimiento?.estado || "");
  const id = mantenimiento?.numero;
  const [activos, setActivos] = useState([]);
  const [selectedActivos, setSelectedActivos] = useState([]);
  const [mostrarTablaAgregar, setMostrarTablaAgregar] = useState(false);
  const [mostrarAgregarActividad, setMostrarAgregarActividad] = useState(false);
  const [error, setError] = useState(null);
  const [mostrarListaActividad, setMostrarListaActividad] = useState(false);
  const [mostrarCuadroConf, setmostrarCuadroConf] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ titulo: "", mensaje: "" });
  const [showModalError, setShowModalError] = useState(false);
  const [modalDataError, setModalDataError] = useState({
    titulo: "",
    mensaje: "",
  });
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    if (!mantenimiento?.numero) {
      const savedMantenimiento = JSON.parse(
        localStorage.getItem("mantenimiento")
      );
      if (savedMantenimiento) {
        setMantenimiento(savedMantenimiento);
        console.log(mantenimiento)
        console.log(mantenimiento.inicio);
        setFechaInicio(mantenimiento?.inicio);
 
      } else {
        console.error("No se encontraron datos de mantenimiento.");
        navigate("/"); 
      }
    } else {
      console.log(mantenimiento);
      localStorage.setItem("mantenimiento", JSON.stringify(mantenimiento));
    }
    const fetchActivos = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/activosporMantenimiento",
          { id }
        );
        setActivos(response.data);
      } catch (err) {
        console.error("Error al obtener los activos:", err);
        setError("No se pudieron cargar los activos.");
      }
    };
    /*const consultarMantenimiento = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/consultarMantenimiento",
          {
            id: id,
          }
        );
        console.log(mantenimiento);
        setdataMantenimiento(response.data);
        console.log(response.data);
        if (response.data && response.data[0].fecha_fin) {
          setIsDisabled(true);
        }
      } catch (err) {
        console.error("Error al consultar el mantenimiento:", err);
      }
    };
*/
    //  consultarMantenimiento();
    fetchActivos();
  }, [id]);

  const agregarActivos = () => {
    setMostrarTablaAgregar(true);
  };

  const cerrarListado = () => {
    setMostrarTablaAgregar(false);
  };

  const agregarActividad = (idActivo) => {
    console.log("ID del activo:", idActivo);
    setMostrarAgregarActividad(true);
    setActivoSeleccionado(idActivo);
  };
  const verActividades = (idActivo) => {
    console.log("ID del activo:", idActivo);
    setMostrarAgregarActividad(true);
    setActivoSeleccionado(idActivo);
  };
  const mostrarCuadro = (idActivo) => {
    console.log("ID del activo:", idActivo);
    setmostrarCuadroConf(true);
    setActivoSeleccionado(idActivo);
  };
  const cerrarCuadro = () => {
    setmostrarCuadroConf(false);
  };

  const cerrarAgregarActividad = () => {
    setMostrarAgregarActividad(false);
  };
  const verListaActividades = (idActivo) => {
    console.log("ID del activo:", idActivo);
    setMostrarListaActividad(true);
    setActivoSeleccionado(idActivo);
  };
  const cerrarListaActividad = () => {
    setMostrarListaActividad(false);
  };
  const handleSelectActivo = (activoSeleccionado) => {
    setSelectedActivos((prevSelected) =>
      prevSelected.some(
        (activo) => activo.id_activo === activoSeleccionado.id_activo
      )
        ? prevSelected.filter(
            (activo) => activo.id_activo !== activoSeleccionado.id_activo
          )
        : [...prevSelected, activoSeleccionado]
    );
  };

  const finalizarMantenimiento = async (idActivo) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/finalizarMantenimiento",
        {
          idActivo,
          id,
        }
      );
      if (response.data.message === "Se finalizo el mantenimiento") {
        setModalData({
          titulo: "Finalizado",
          mensaje: "El mantenimiento del activo se finalizo con exito.",
        });
        setShowModal(true);

        setTimeout(() => {
          setShowModal(false);
        }, 3000);
        setActivos((prevActivos) =>
          prevActivos.map((activo) =>
            activo.id_activo === idActivo
              ? { ...activo, estado_mantenimiento: "finalizado" }
              : activo
          )
        );
      } else {
        setModalDataError({
          titulo: "Error al finalizar mantenimiento del activo",
          mensaje: "No se pudo finalizar el mantenimiento del activo.",
        });
        setShowModalError(true);
        setTimeout(() => {
          setShowModalError(false);
        }, 3000);
      }
    } catch (err) {
      console.error("Error al finalizar el mantenimiento:", err);
      alert("Hubo un error al finalizar el mantenimiento.");
    }
  };

  const confirmEliminacion = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/eliminarActivoDeMantenimiento",
        {
          id: activoSeleccionado,
        }
      );
      console.log(response);
      if (response.data === "Éxito") {
        setModalData({
          titulo: "Activo eliminado",
          mensaje: "El activo y sus actividades se eliminaron con éxito.",
        });
        setShowModal(true);

        setTimeout(() => {
          setShowModal(false);
          window.location.reload();
        }, 3000);
        setActivos((prevActivos) =>
          prevActivos.filter((activo) => activo.id !== id)
        );
      } else {
        setModalDataError({
          titulo: "Error al eliminar activo",
          mensaje:
            "No se pudo eliminar el activo, por favor intenta mas tarde ",
        });
        setShowModalError(true);
        setTimeout(() => {
          setShowModalError(false);
        }, 3000);
      }
    } catch (err) {
      console.error("Error al finalizar el mantenimiento total:", err);
      alert("Hubo un error al finalizar el mantenimiento total.");
    }
    cerrarCuadro();
  };

  const finalizarMantenimientoTotal = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/finalizarmantenimientototal",
        {
          id: id,
          idActivos: activos.map((activo) => activo.id_activo),
        }
      );
      if (
        response.data.message ===
        "Se finalizaron los mantenimientos de los activos con éxito."
      ) {
        setModalData({
          titulo: "Finalizado",
          mensaje:
            "El mantenimiento de todos los activos se finalizo con exito.",
        });
        setShowModal(true);

        setTimeout(() => {
          setShowModal(false);
          window.location.reload();
        }, 3000);
        setActivos((prevActivos) =>
          prevActivos.map((activo) => ({
            ...activo,
            estado_mantenimiento: "finalizado",
          }))
        );
      } else {
        setModalDataError({
          titulo: "Error al finalizar mantenimiento total",
          mensaje:
            "No se pudo finalizar el mantenimiento de todos los activos.",
        });
        setShowModalError(true);
        setTimeout(() => {
          setShowModalError(false);
        }, 3000);
      }
    } catch (err) {
      console.error("Error al finalizar el mantenimiento total:", err);
      alert("Hubo un error al finalizar el mantenimiento total.");
    }
  };

  const handleFechaInicioChange = (e) => {
    setFechaInicio(e.target.value);
  };

  const handlefechaFinChange = (e) => {
    setfechaFin(e.target.value);
  };

  const handleTipoChange = (e) => {
    setTipo(e.target.value);
  };
  const handleEstadoChange = (e) => {
    setTipo(e.target.value);
  };
  const CerrarSesion = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  return (
    <div>
      <div
        style={{
          backgroundColor: "rgb(163, 33, 38)",
          color: "white",
          height: "60px", // Reducir altura
          padding: "10px 20px", // Ajustar padding
        }}
        className="d-flex justify-content-between align-items-center"
      >
        <div className="d-flex align-items-center">
          <button></button>
        </div>
        <h2
          style={{ textAlign: "center", color: "White", marginBottom: "2,5px" }}
        >
          MANTENIMIENTO N° {id}
        </h2>
        <div className="d-flex align-items-center">
          <button
            className="btn text-white d-flex align-items-center"
            onClick={CerrarSesion}
          >
            <img
              src="../../public/SESION CERR.png"
              alt="Cerrar Sesión"
              style={{ width: "40px", height: "40px", marginRight: "8px" }} // Reducir tamaño de icono
            />
            Cerrar Sesión
          </button>
        </div>
      </div>
      <button
        onClick={() => navigate("/")}
        className="btn"
        style={{
          backgroundColor: "rgb(255, 255, 255)",
          color: "black",
          cursor: "pointer",
          fontWeight: "bold",
          borderRadius: "35px",
          fontSize: "18px",
          padding: "5px 15px",
          marginRight: "10px",
          position: "absolute",
          top: "10px",
          left: "10px",
        }}
      >
        Volver
      </button>
      <div style={{ padding: "20px", backgroundColor: "", color: "black" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            margin: "20px 0",
          }}
        >
          <div style={{ flex: "1", minWidth: "200px", marginBottom: "10px" }}>
            <label style={{ fontWeight: "bold" }}>Código mantenimiento:</label>
            <p>{mantenimiento.codigo}</p>
          </div>
          <div style={{ flex: "1", minWidth: "200px", marginBottom: "10px" }}>
            <label style={{ fontWeight: "bold" }}>Fecha Inicio:</label>
            <input
              type="date"
              value={fechaInicio}
              style={{ width: "100%" }}
              onChange={handleFechaInicioChange}
            />
          </div>
          <div style={{ flex: "1", minWidth: "200px", marginBottom: "10px" }}>
            <label style={{ fontWeight: "bold" }}>Fecha Fin:</label>
            <input
              type="date"
              value={fechaFin}
              style={{ width: "100%" }}
              onChange={handlefechaFinChange}
            />
          </div>
          <div style={{ flex: "1", minWidth: "200px", marginBottom: "10px" }}>
            <label style={{ fontWeight: "bold" }}>Tipo Mantenimiento:</label>
            <select
              style={{ width: "100%" }}
              value={tipo}
              onChange={handleTipoChange}
            >
              <option value="preventivo">Preventivo</option>
              <option value="correctivo">Correctivo</option>
            </select>
          </div>
          <div style={{ flex: "1", minWidth: "200px", marginBottom: "10px" }}>
            <label style={{ fontWeight: "bold" }}>Entidad Encargada:</label>
            <select style={{ width: "100%" }}>
              <option value="laboratorista">Laboratorista</option>
              <option value="externo">Externo</option>
            </select>
          </div>
          <div style={{ flex: "1", minWidth: "200px", marginBottom: "10px" }}>
            <label style={{ fontWeight: "bold" }}>Estado Mantenimiento:</label>
            <select
              style={{ width: "100%" }}
              value={estado}
              onChange={handleEstadoChange}
            >
              <option value="en_proceso">En Proceso</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>
          <div style={{ flex: "1", minWidth: "200px", marginBottom: "10px" }}>
            <label style={{ fontWeight: "bold" }}>Responsable:</label>
            <select style={{ width: "25%" }}>
              <option value="luis_fernandez">Luis Fernandez</option>
              <option value="ana_gomez">Ana Gomez</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ margin: "20px auto", maxWidth: "80%", marginTop: "-10px" }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            alignItems: "center",
          }}
        >
          <button
            onClick={agregarActivos}
            className="btn"
            style={{
              backgroundColor: "rgb(163, 33, 38)",
              color: "white",
              marginRight: "10px",
            }}
            disabled={isDisabled}
          >
            Agregar Activos
          </button>
        </div>

        <div
          style={{
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          <table
            className="table-bordered"
            style={{ border: "2px solid black", width: "100%" }}
          >
            <thead
              style={{
                backgroundColor: "#a32126",
                height: "50px",
                color: "white",
                textAlign: "center",
                position: "sticky",
                top: 0,
                zIndex: 1, // Asegura que el encabezado quede encima de las filas al hacer scroll
              }}
            >
              <tr>
                <th scope="col">ID Activo</th>
                <th scope="col">Número de Serie</th>
                <th scope="col">Tipo de Activo</th>
                <th scope="col">Estado Mantenimiento</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody style={{ textAlign: "center" }}>
              {activos.length > 0 ? (
                activos.map((activo) => (
                  <tr style={{ height: "45px" }} key={activo.id_activo}>
                    <td>{activo.id_activo}</td>
                    <td>{activo.numero_serie}</td>
                    <td>{activo.tipo_activo}</td>
                    <td>{activo.estado_mantenimiento.toUpperCase()}</td>
                    <td>
                      {activo.estado_mantenimiento === "en proceso" && (
                        <>
                          <i
                            className="fas fa-eye"
                            style={{
                              color: "rgb(50, 50, 50)",
                              cursor: "pointer",
                              marginRight: "10px",
                            }}
                            onClick={() => verListaActividades(activo)}
                          ></i>
                          <i
                            className="fas fa-book"
                            style={{
                              color: "rgb(163, 33, 38)",
                              cursor: "pointer",
                              marginRight: "10px",
                            }}
                            onClick={() => agregarActividad(activo)}
                          ></i>
                          <i
                            className="fas fa-trash"
                            style={{
                              color: "rgb(200, 0, 0)",
                              cursor: "pointer",
                            }}
                            onClick={() => mostrarCuadro(activo)}
                          ></i>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr style={{ height: "60px" }}>
                  <td colSpan="9" className="text-center">
                    No se encontraron activos asociados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mostrarTablaAgregar && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.68)", // Fondo negro semi-transparente
              zIndex: 1040, // Debe estar detrás del modal pero encima del contenido de la página
            }}
          ></div>

          {/* Modal */}
          <div
            className="modal fade show"
            style={{ display: "block", zIndex: 1050 }} // Asegura que el modal esté encima del overlay
            aria-labelledby="agregarActividadModal"
            aria-hidden="true"
          >
            <div
              className="modal-dialog"
              style={{ maxWidth: "1000px", maxHeight: "1000px" }}
            >
              <div className="modal-content">
                <div className="modal-body">
                  <ListadoActivo
                    closeModal={cerrarListado}
                    idMantenimiento={id}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {mostrarAgregarActividad && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.68)", // Fondo negro semi-transparente
              zIndex: 1040, // Debe estar detrás del modal pero encima del contenido de la página
            }}
          ></div>

          {/* Modal */}
          <div
            className="modal fade show"
            style={{ display: "block", zIndex: 1050 }} // Asegura que el modal esté encima del overlay
            aria-labelledby="agregarActividadModal"
            aria-hidden="true"
          >
            <div
              className="modal-dialog"
              style={{ maxWidth: "1000px", maxHeight: "1000px" }}
            >
              <div className="modal-content">
                <div className="modal-body">
                  <AgregarActividad
                    activosSeleccionados={activoSeleccionado}
                    closeModal={cerrarAgregarActividad}
                    idMantenimiento={id}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {mostrarListaActividad && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.68)", // Fondo negro semi-transparente
              zIndex: 1040, // Debe estar detrás del modal pero encima del contenido de la página
            }}
          ></div>

          {/* Modal */}
          <div
            className="modal fade show"
            style={{ display: "block", zIndex: 1050 }} // Asegura que el modal esté encima del overlay
            aria-labelledby="agregarActividadModal"
            aria-hidden="true"
          >
            <div
              className="modal-dialog"
              style={{ maxWidth: "1000px", maxHeight: "1000px" }}
            >
              <div className="modal-content">
                <div className="modal-body">
                  <ListaActividad
                    activo={activoSeleccionado}
                    closeModal={cerrarListaActividad}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {mostrarCuadroConf && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.68)",
              zIndex: 1040,
              display: "flex", // Centrar contenido
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Modal */}
            <div
              className="modal-dialog"
              style={{
                width: "auto",
                maxWidth: "100%",
                margin: "1.75rem auto",
              }}
            >
              <div
                className="modal-content"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "1rem",
                }}
              >
                <CuadroConf
                  title="¿Estás seguro de que deseas eliminar este activo?"
                  message=" Esta acción eliminará el activo y actividades asociadas a el 
             permanentemente de este mantenimiento . 
            ¿Estás seguro de continuar?"
                  ConfirmText="Eliminar"
                  cancelText="Cancel"
                  closeModal={cerrarCuadro}
                  onConfirm={confirmEliminacion} // Pasar la función al hijo
                />
              </div>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <SuccessModal
          titulo={modalData.titulo}
          mensaje={modalData.mensaje}
          onClose={() => setShowModal(false)}
        />
      )}
      {showModalError && (
        <ErrorModal
          titulo={modalDataError.titulo}
          mensaje={modalDataError.mensaje}
          onClose={() => setShowModalError(false)}
        />
      )}
    </div>
  );
}

export default MantenimientoVisual;
