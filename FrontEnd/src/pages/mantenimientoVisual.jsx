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

function MantenimientoVisual() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mantenimiento, setMantenimiento] = useState(
    location.state?.mantenimiento || {}
  );
  const [activoSeleccionado, setActivoSeleccionado] = useState(null);


  const [fechaInicio, setFechaInicio] = useState(mantenimiento?.inicio || "");
  const [fechaFin, setFechaFin] = useState(mantenimiento?.fin || "");
  const [tipo, setTipo] = useState(mantenimiento?.tipo || "preventivo");
  const [estado, setEstado] = useState(mantenimiento?.estado || "");
  const [dataMantenimiento, setdataMantenimiento] = useState(null);
  const id = mantenimiento?.numero;
  const [activos, setActivos] = useState([]);
  const [selectedActivos, setSelectedActivos] = useState([]);
  const [mostrarTablaAgregar, setMostrarTablaAgregar] = useState(false);
  const [mostrarAgregarActividad, setMostrarAgregarActividad] = useState(false);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ titulo: "", mensaje: "" });
  const [showModalError, setShowModalError] = useState(false);
  const [modalDataError, setModalDataError] = useState({
    titulo: "",
    mensaje: "",
  });
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
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
    const consultarMantenimiento = async () => {
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

    consultarMantenimiento();
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

  const cerrarAgregarActividad = () => {
    setMostrarAgregarActividad(false);
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
        <div className="d-flex align-items-center">
          <button className="btn text-white d-flex align-items-center"
          onClick={CerrarSesion}>
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
        <h2
          style={{ textAlign: "center", color: "black", marginBottom: "20px" }}
        >
          MANTENIMIENTO N° {id}
        </h2>
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

      <div style={{ margin: "20px auto", maxWidth: "80%" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
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

          {/** * <button
            onClick={finalizarMantenimientoTotal}
            className="btn"
            style={{
              backgroundColor: "rgb(163, 33, 38)",
              color: "white",
              marginRight: "10px",
            }}
            disabled={isDisabled}
          >
            Finalizar Mantenimiento
          </button>
          */}
        </div>
        <table
          className="table-bordered"
          style={{
            border: "2px solid black",
            width: "100%",
            margin: "auto",
          }}
        >
          <thead
            style={{
              backgroundColor: "#921c21",
              color: "white",
              textAlign: "center",
            }}
          >
            <tr>
              {/* <th scope="col">Seleccionar</th>*/}
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
                <tr key={activo.id_activo}>
                  {/** <td>
                    <input
                      type="checkbox"
                      disabled={
                        isDisabled ||
                        activo.estado_mantenimiento === "finalizado"
                      }
                      checked={selectedActivos.some(
                        (selected) => selected.id_activo === activo.id_activo
                      )}
                      onChange={() => handleSelectActivo(activo)}
                    />
                  </td>
            */}
                  <td>{activo.id_activo}</td>
                  <td>{activo.numero_serie}</td>
                  <td>{activo.tipo_activo}</td>
                  <td>{activo.estado_mantenimiento}</td>
                  <td>
                    {activo.estado_mantenimiento === "en proceso" && (
                      <a
                      onClick={() => agregarActividad(activo.id_activo)}
                      style={{
                          color: "rgb(163, 33, 38)",
                          cursor: "pointer",
                          marginTop: "10px",
                          textDecoration: "underline",
                        }}
                        href="#"
                      >
                        Agregar actividad
                      </a>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No se encontraron activos asociados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {mostrarTablaAgregar && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          aria-labelledby="listadoActivosModal"
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
      )}

      {mostrarAgregarActividad && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
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
