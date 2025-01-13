import axios from "axios";
import { useEffect, useState } from "react";
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";

function Listadoactivo({ closeModal, idMantenimiento }) {
  const [activos, setActivos] = useState([]);
  const [selectedActivos, setSelectedActivos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ titulo: "", mensaje: "" });
  const [showModalError, setShowModalError] = useState(false);
  const [modalDataError, setModalDataError] = useState({
    titulo: "",
    mensaje: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/activos-disponibles")
      .then((response) => setActivos(response.data))
      .catch((err) => {
        setModalDataError({
          titulo: "Error al cargar activos",
          mensaje: "No se pudo obtener la lista de activos disponibles.",
        });
        setShowModalError(true);
      });
  }, []);

  const handleSelectActivo = (id) => {
    setSelectedActivos((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  const selectAllActivos = (checked) => {
    setSelectedActivos(
      checked ? activos.map((activo) => activo.id_activo) : []
    );
  };

  const resetModalStates = () => {
    setShowModal(false);
    setShowModalError(false);
    setModalData({ titulo: "", mensaje: "" });
    setModalDataError({ titulo: "", mensaje: "" });
  };

  const handleSubmit = async () => {
    if (selectedActivos.length === 0) {
      setModalDataError({
        titulo: "Error de Validación",
        mensaje: "Por favor selecciona al menos un activo.",
      });
      setShowModalError(true);
      setTimeout(() => {
        setShowModalError(false);
      }, 3000);
      return;
    }

    try {
      resetModalStates();

      const response = await axios.post(
        "http://localhost:5000/guardar_activos",
        {
          idMantenimiento, // Incluye el ID del mantenimiento
          activos: selectedActivos,
        }
      );

      if (response.data.message === "Activos guardados con éxito") {
        setModalData({
          titulo: "Activos Agregados",
          mensaje: "Los activos se agregaron con éxito.",
        });
        setShowModal(true);

        setTimeout(() => {
          setShowModal(false);
          closeModal();
          window.location.reload();
        }, 3000);
      } else {
        setModalDataError({
          titulo: "Error al agregar activos",
          mensaje: "No se pudo agregar los activos.",
        });
        setShowModalError(true);
        setTimeout(() => {
          setShowModalError(false);
          closeModal();
        }, 3000);
      }
    } catch (err) {
      setModalDataError({
        titulo: "Error al agregar activos",
        mensaje: err.response?.data?.error || "Ocurrió un error inesperado.",
      });
      console.log(err);
      setShowModalError(true);
      setTimeout(() => {
        setShowModal(false);
        closeModal();
      }, 3000);
    }
  };
  return (
    <div>
      <div
        className="d-flex justify-content-center text-center align-items-center mb-4"
        style={{ position: "relative" }} // Añadir posición relativa al contenedor
      >
        <h4
          style={{
            fontWeight: "bold",
            textAlign: "center",
            marginTop: "-12px",
            backgroundColor: "#a32126",
            padding: "15px 20px",
            borderRadius: "5px 5px 0 0",
            color: "white",
            margin: "0",
            width: "102%",
            boxSizing: "border-box",
          }}
        >
          Seleccionar Activos
        </h4>
        <span
          className="close"
          style={{
            fontSize: "2rem",
            cursor: "pointer",
            fontWeight: "bold",
            color: "white", 
            position: "absolute", 
            top: "10px",
            right: "10px",
          }}
          onClick={closeModal}
        >
          &times;
        </span>
      </div>

      <div>
        <input
          type="checkbox"
          onChange={(e) => selectAllActivos(e.target.checked)}
          checked={
            selectedActivos.length === activos.length && activos.length > 0
          }
        />
        Seleccionar Todos
        <div
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            border: "1px solid #ddd",
            borderRadius: "5px",
            padding: "10px",
          }}
        >
          <table
            className="table-bordered"
            style={{ border: "2px solid black", width: "100%" }}
          >
            <thead
              className="p-4"
              style={{
                backgroundColor: "#921c21",
                height: "50px",
                color: "white",
                textAlign: "center",
              }}
            >
              <tr>
                <th scope="col">Seleccionar</th>
                <th scope="col">Número de Serie</th>
                <th scope="col">Clase</th>
                <th scope="col">Tipo de Activo</th>
                <th scope="col">Estado</th>
                <th scope="col">Ubicación</th>
                <th scope="col">Fecha Registro</th>
              </tr>
            </thead>
            <tbody style={{ textAlign: "center" }}>
              {activos.map((activo) => (
                <tr key={activo.id_activo} style={{ height: "60px" }}>
                  <td className="text-center">
                    <input
                      style={{
                        transform: "scale(1.5)",
                        margin: "5px",
                        cursor: "pointer",
                      }}
                      type="checkbox"
                      checked={selectedActivos.includes(activo.id_activo)}
                      onChange={() => handleSelectActivo(activo.id_activo)}
                    />
                  </td>
                  <td>{activo.numero_serie}</td>
                  <td>{activo.clase}</td>
                  <td>{activo.tipo}</td>
                  <td>{activo.estado}</td>
                  <td>{activo.ubicacion}</td>
                  <td>
                    {
                      new Date(activo.fecha_registro)
                        .toISOString()
                        .split("T")[0]
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        {" "}
        {/* Cambiado a center */}
        <button
          onClick={handleSubmit}
          className="btn"
          style={{
            marginTop: "10px",
            backgroundColor: "#921c21",
            color: "white",
            padding: "7px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          Agregar Activos
        </button>
      </div>

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

export default Listadoactivo;
