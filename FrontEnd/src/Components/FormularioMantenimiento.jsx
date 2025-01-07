import axios from "axios";
import { useEffect, useState } from "react";
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

function FormularioMantenimiento({ closeModal, recargarTabla }) {
  const [activos, setActivos] = useState([]);
  const [selectedActivos, setSelectedActivos] = useState([]);
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [identificador, setIdentificador] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ titulo: "", mensaje: "" });
  const [showModalError, setShowModalError] = useState(false);
  const [modalDataError, setModalDataError] = useState({
    titulo: "",
    mensaje: "",
  });

  const [tipoEncargado, setTipoEncargado] = useState("");
  const [encargados, setEncargados] = useState([]);

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

  useEffect(() => {
    if (tipoEncargado) {
      const url =
        tipoEncargado === "laboratorista"
          ? "http://localhost:5000/laboratoristas"
          : "http://localhost:5000/empresas_mantenimientos";
      axios
        .get(url)
        .then((response) => setEncargados(response.data))
        .catch((err) => {
          setModalDataError({
            titulo: "Error al cargar encargados",
            mensaje:
              "No se pudo obtener la lista de encargados (laboratoristas/empresas).",
          });
          setShowModalError(true);
        });
    }
  }, [tipoEncargado]);

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
    if (
      !tipo ||
      !descripcion ||
      !identificador ||
      selectedActivos.length === 0
    ) {
      setModalDataError({
        titulo: "Error de Validación",
        mensaje:
          "Por favor completa todos los campos y selecciona al menos un activo.",
      });
      setShowModalError(true);
      setTimeout(() => {
        resetModalStates(); //para que el modal se muestre nuevamente
      }, 3000);
      return;
    }

    try {
      resetModalStates();

      const response = await axios.post(
        "http://localhost:5000/crear-mantenimiento",
        {
          tipo,
          descripcion,
          identificador,
          activos: selectedActivos,
        }
      );

      if (response.data.message === "Mantenimiento creado con éxito") {
        setModalData({
          titulo: "Mantenimiento Creado",
          mensaje: "El mantenimiento se creó con éxito.",
        });

        // Recargar la tabla al crear el mantenimiento
        if (recargarTabla) {
          recargarTabla();
        }

        setShowModal(true);

        setTimeout(() => {
          setShowModal(false);
          closeModal();
        }, 3000);
      } else {
        setModalDataError({
          titulo: "Error al crear mantenimiento",
          mensaje: "No se pudo crear el mantenimiento.",
        });
        setShowModalError(true);
      }
    } catch (err) {
      setModalDataError({
        titulo: "Error al crear mantenimiento",
        mensaje: err.response?.data?.error || "Ocurrió un error inesperado.",
      });
      setShowModalError(true);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between text-center align-items-center mb-4">
        <h4>Registrar Nuevo Mantenimiento</h4>
        <span
          className="close"
          style={{
            fontSize: "2rem",
            cursor: "pointer",
            fontWeight: "bold",
            color: "#921c21",
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
                  <td>{activo.tipo_activo}</td>
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

      <div
        style={{
          marginTop: "7px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <TextField
          select
          value={tipoEncargado}
          onChange={(e) => setTipoEncargado(e.target.value)}
          variant="outlined"
          style={{ width: "200px" }}
          SelectProps={{ native: true }}
        >
          <option value="">Entidad Encargada</option>
          <option value="laboratorista">Laboratorista</option>
          <option value="empresa">Empresa</option>
        </TextField>

        {tipoEncargado && (
          <TextField
            select
            value={identificador}
            onChange={(e) => setIdentificador(e.target.value)}
            variant="outlined"
            style={{ width: "250px" }}
            SelectProps={{ native: true }}
          >
            <option value="">Encargado</option>
            {encargados.map((encargado) => (
              <option
                key={encargado.id}
                value={encargado.cedula || encargado.ruc}
              >
                {tipoEncargado === "laboratorista"
                  ? encargado.nombre + " " + encargado.apellido
                  : encargado.nombre}
              </option>
            ))}
          </TextField>
        )}

        <TextField
          select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          variant="outlined"
          style={{ width: "200px" }}
          SelectProps={{ native: true }}
        >
          <option value="">Tipo Mantenimiento</option>
          <option value="preventivo">Preventivo</option>
          <option value="correctivo">Correctivo</option>
        </TextField>

        <TextField
          label="Descripción"
          inputProps={{ maxLength: 70 }}
          variant="outlined"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          multiline
          style={{ width: "250px" }}
        />

        <button
          onClick={handleSubmit}
          className="btn"
          style={{
            backgroundColor: "rgb(163, 33, 38)",
            color: "white",
            marginLeft: 100,
          }}
        >
          Crear Mantenimiento
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

FormularioMantenimiento.propTypes = {
  closeModal: PropTypes.func.isRequired,
  recargarTabla: PropTypes.func.isRequired,
};

export default FormularioMantenimiento;
