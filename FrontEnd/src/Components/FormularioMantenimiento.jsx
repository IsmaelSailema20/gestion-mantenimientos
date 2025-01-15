import axios from "axios";
import { useEffect, useState } from "react";
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";
import PropTypes from "prop-types";
import TablaActivosMntenimientos from "./TablaActivosMantenimientos";
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
  const [fechaInicio, setFechaInicio] = useState("");
  const [modalDataError, setModalDataError] = useState({
    titulo: "",
    mensaje: "",
  });
  const hoy = new Date().toISOString().split("T")[0]; // Obtén la fecha actual en formato 'YYYY-MM-DD'

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
  const handleSelectedActivosChange = (selectedActivos) => {
    console.log("Activos seleccionados:", selectedActivos);
    setSelectedActivos(selectedActivos);
    // Puedes hacer algo con los activos seleccionados aquí
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

  const handleFechaChange = (e) => {
    const nuevaFecha = e.target.value;
    if (nuevaFecha >= hoy) {
      setFechaInicio(nuevaFecha);
    } else {
      setModalDataError({
        titulo: "Fecha inválida",
        mensaje: "La fecha no puede ser anterior a la fecha actual",
      });
      setShowModalError(true);
    }
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
          activos: selectedActivos.map((activo) => activo.id_activo), // Extraer solo los IDs
          fecha: fechaInicio,
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

  const columnas = [
    { header: "Código", render: (activo) => activo.numero_serie },
    { header: "Tipo", render: (activo) => activo.tipo },
    {
      header: "Fecha Registro",
      render: (activo) =>
        new Date(activo.fecha_registro).toISOString().split("T")[0],
    },
    { header: "Ubicación", render: (activo) => activo.ubicacion },
    { header: "Proveedor", render: (activo) => activo.proveedor },
    { header: "Clase", render: (activo) => activo.clase },
  ];

  const filtrosConfig = [
    {
      field: "ubicacion",
      apiEndpoint: "http://localhost:5000/ubicaciones-filtro",
    },
    {
      field: "tipo",
      options: ["Informático", "No Informático"],
    },
    {
      field: "proveedor",
      apiEndpoint: "http://localhost:5000/proveedores-filtro",
    },
    {
      field: "clase",
      apiEndpoint: "http://localhost:5000/clase-filtro",
    },
  ];
  return (
    <div className="container p-4 ">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Registrar Nuevo Mantenimiento</h4>
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

      <div className="row g-3">
        {/* Columnas de la izquierda: dos filas */}
        <div className="col-md-8">
          <div className="row">
            {/* Primera fila: Entidad Encargada y Encargado */}
            <div className="col-md-6">
              <TextField
                select
                value={tipoEncargado}
                onChange={(e) => setTipoEncargado(e.target.value)}
                variant="outlined"
                className="form-control"
                SelectProps={{ native: true }}
                label="Entidad Encargada"
              >
                <option value=""></option>
                <option value="laboratorista">Laboratorista</option>
                <option value="empresa">Empresa</option>
              </TextField>
            </div>
            <div className="col-md-6">
              <TextField
                select
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                variant="outlined"
                className="form-control"
                SelectProps={{ native: true }}
                label="Encargado"
              >
                <option value=""></option>
                {encargados.map((encargado) => (
                  <option
                    key={encargado.id}
                    value={encargado.cedula || encargado.ruc}
                  >
                    {tipoEncargado === "laboratorista" && tipoEncargado
                      ? `${encargado.nombre} ${encargado.apellido}`
                      : encargado.nombre}
                  </option>
                ))}
              </TextField>
            </div>
          </div>

          <div className="row mt-3">
            {/* Segunda fila: Fecha de Fin y Tipo de Mantenimiento */}
            <div className="col-md-6">
              <TextField
                type="date"
                label="Fecha de Inicio"
                value={fechaInicio}
                onChange={handleFechaChange}
                variant="outlined"
                className="form-control"
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: hoy }} // Configura el valor mínimo permitido
              />
            </div>
            <div className="col-md-6">
              <TextField
                select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                variant="outlined"
                className="form-control"
                SelectProps={{ native: true }}
                label="Tipo de Mantenimiento"
              >
                <option value=""></option>
                <option value="preventivo">Preventivo</option>
                <option value="correctivo">Correctivo</option>
              </TextField>
            </div>
          </div>
        </div>

        {/* Columna de la derecha: Descripción */}
        <div className="col-md-4 d-flex align-items-center">
          <TextField
            label="Descripción del mantenimiento"
            inputProps={{ maxLength: 250 }}
            variant="outlined"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            multiline
            rows={4}
            className="form-control"
          />
        </div>

        {/* Botón de Crear */}
        <div className="col-12 text-end">
          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-danger"
          >
            Crear Mantenimiento
          </button>
        </div>
      </div>
      <TablaActivosMntenimientos
        activos={activos}
        handleSelectActivo={handleSelectActivo}
        columnas={columnas}
        filtrosConfig={filtrosConfig}
        onSelectedActivosChange={handleSelectedActivosChange}
      />

      {/* Modales de Éxito y Error */}
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
