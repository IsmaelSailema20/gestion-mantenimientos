import axios from "axios";
import { useEffect, useState } from "react";
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";
import PropTypes from "prop-types";

function FormularioActivo({ closeModal, agregarActivo }) {
  const [bloques, setBloques] = useState([]); // Estado para los bloques (edificios)
  const [laboratorios, setLaboratorios] = useState([]); // Estado para los laboratorios
  const [selectedBloque, setSelectedBloque] = useState(""); // Estado para el bloque seleccionado
  const [selectedLaboratorio, setSelectedLaboratorio] = useState(""); // Estado para el laboratorio seleccionado
  const [encargados, setEncargados] = useState([]);
  const [selectedEncargado, setSelectedEncargado] = useState("");
  const [proveedores, setProveedores] = useState([]);
  const [selectedProveedor, setSelectedProveedor] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ titulo: "", mensaje: "" });
  const [showModalError, setShowModalError] = useState(false);
  const [modalDataError, setModalDataError] = useState({
    titulo: "",
    mensaje: "",
  });
  const [formData, setFormData] = useState({
    nombreActivo: "",
    modelo: "",
    marca: "",
    tipoActivo: "",
    numeroSerie: "",
    procesoCompra: "",
    proveedor: "",
    bloque: "",
    laboratorio: "",
    estado: "",
    especificaciones: "",
    observaciones: "",
    encargado: "",
  });
  const [errors, setErrors] = useState({
    nombreActivo: false,
    modelo: false,
    marca: false,
    tipoActivo: false,
    numeroSerie: false,
    procesoCompra: false,
    proveedor: false,
    bloque: false,
    laboratorio: false,
    estado: false,
    especificaciones: false,
    observaciones: false,
    encargado: false,
  });

  // Función para manejar los cambios en los campos del formulario
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    setErrors({ ...errors, [id]: value.trim() === "" });
  };

  // Función para manejar la selección del estado
  const handleEstadoChange = (e) => {
    setFormData({ ...formData, estado: e.target.value });
    setErrors({ ...errors, estado: e.target.value.trim() === "" });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar campos requeridos
    const newErrors = {};
    let fieldsAreEmpty = false;
    Object.keys(formData).forEach((key) => {
      if (formData[key].trim() === "") {
        newErrors[key] = true; // Marcar campo como vacío
        fieldsAreEmpty = true; // Detectar si hay campos vacíos
      } else {
        newErrors[key] = false;
      }
    });

    // Validación del estado (debe ser un valor)
    if (formData.estado === "") {
      newErrors.estado = true;
      fieldsAreEmpty = true;
    } else {
      newErrors.estado = false;
    }

    setErrors(newErrors);

    // Si hay campos vacíos, mostrar el modal de error y no enviar el formulario
    if (fieldsAreEmpty) {
      setModalDataError({
        titulo: "Campos vacíos",
        mensaje: "Por favor, complete todos los campos requeridos.",
      });
      setShowModalError(true); // Mostrar el modal de error
      return; // No enviar el formulario
    }
    setShowModalError(false);
    // Construir los datos que quieres enviar al backend
    const dataToSend = {
      nombreActivo: formData.nombreActivo,
      modelo: formData.modelo,
      marca: formData.marca,
      tipoActivo: formData.tipoActivo,
      numeroSerie: formData.numeroSerie,
      procesoCompra: formData.procesoCompra,
      proveedor: selectedProveedor, // Usamos el valor del proveedor seleccionado
      bloque: selectedBloque, // El bloque seleccionado
      laboratorio: selectedLaboratorio, // El laboratorio seleccionado
      estado: formData.estado,
      especificaciones: formData.especificaciones,
      observaciones: formData.observaciones,
      encargado: selectedEncargado, // Usamos el valor del encargado seleccionado
    };

    // Realizar la solicitud POST para guardar los datos en la base de datos
    axios
      .post("http://localhost:5000/registrarActivos", dataToSend)
      .then((response) => {
        console.log("Activo guardado:", response.data);

        // Si la solicitud es exitosa, agregar el activo a la lista de activos en Home
        agregarActivo(response.data); // Agregar el nuevo activo al estado de Home

        // Si la solicitud es exitosa, muestra el modal de éxito
        setModalData({
          titulo: "¡Operación Exitosa!",
          mensaje: "El activo se ha registrado correctamente.",
        });
        setShowModal(true); // Mostrar el modal de éxito
        setShowModalError(false); // Ocultar el modal de error

        setFormData({
          nombreActivo: "",
          modelo: "",
          marca: "",
          tipoActivo: "",
          numeroSerie: "",
          procesoCompra: "",
          proveedor: "",
          bloque: "",
          laboratorio: "",
          estado: "",
          especificaciones: "",
          observaciones: "",
          encargado: "",
        });
      })
      .catch((error) => {
        console.error("Error al guardar el activo:", error);
        // Si hay un error, muestra el modal de error
        setModalDataError({
          titulo: "Error al registrar",
          mensaje: "Error al registrar el activo. Inténtalo de nuevo.",
        });
        setShowModalError(true); // Mostrar el modal de error
        setShowModal(false);
      });
  };

  const handleChangeEncargado = (e) => {
    setSelectedEncargado(e.target.value);
    formData.encargado = e.target.value;
  };

  const handleChangeProveedor = (e) => {
    setSelectedProveedor(e.target.value);
    formData.proveedor = e.target.value;
  };

  useEffect(() => {
    // Hacer múltiples solicitudes en paralelo utilizando Promise.all
    Promise.all([
      axios.get("http://localhost:5000/laboratoristas"),
      axios.get("http://localhost:5000/proveedores"),
      axios.get("http://localhost:5000/edificios"),
    ])
      .then(
        ([laboratoristasResponse, proveedoresResponse, edificiosResponse]) => {
          // Asigna los datos de las respuestas a sus respectivos estados
          setEncargados(laboratoristasResponse.data);
          setProveedores(proveedoresResponse.data);
          setBloques(edificiosResponse.data);
        }
      )
      .catch((error) => {
        console.error("Hubo un error al obtener los datos:", error);
      });
  }, []);

  const getInputClass = (field) => {
    return errors[field] ? "form-control is-invalid" : "form-control";
  };

  // Obtener los laboratorios según el bloque seleccionado
  const handleBloqueChange = (e) => {
    const idEdificio = e.target.value;
    setSelectedBloque(idEdificio);
    formData.bloque = e.target.value; // Establecer el bloque seleccionado

    // Obtener los laboratorios asociados a ese bloque
    if (idEdificio) {
      axios
        .get(`http://localhost:5000/laboratorios/${idEdificio}`) // Endpoint para obtener laboratorios por bloque
        .then((response) => {
          setLaboratorios(response.data); // Guardar los laboratorios en el estado
        })
        .catch((error) => {
          console.error("Error al obtener laboratorios:", error);
        });
    } else {
      setLaboratorios([]); // Si no hay bloque seleccionado, limpiar los laboratorios
    }
  };
  // Manejar el cambio en el laboratorio seleccionado
  const handleLaboratorioChange = (e) => {
    setSelectedLaboratorio(e.target.value);
    formData.laboratorio = e.target.value; // Establecer el laboratorio seleccionado
  };

  return (
    <>
      <div className="d-flex justify-content-between text-center align-items-center mb-4">
        <h4>Registrar Nuevo Activo</h4>
        <span
          className="close"
          style={{
            fontSize: "2rem",
            cursor: "pointer",
            fontWeight: "bold",
            color: " #921c21",
          }}
          onClick={closeModal}
        >
          &times;
        </span>
      </div>
      <form
        onSubmit={handleSubmit}
        style={{
          maxHeight: "600px",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "5px",
        }}
      >
        <div className="d-flex">
          <label
            htmlFor="nombreActivo"
            style={{ width: "300px", fontWeight: "bold" }}
          >
            Nombre del activo
          </label>
          <input
            maxLength="100"
            type="text"
            className={getInputClass("nombreActivo")}
            id="nombreActivo"
            value={formData.nombreActivo}
            onChange={handleChange}
            placeholder="Nombre del activo"
          />
        </div>
        <div className="row">
          {/* Columna 1 */}
          <div className="col-md-6">
            <div className="form-group">
              <label
                htmlFor="modelo"
                style={{
                  fontWeight: "bold",
                  marginBottom: "10px",
                  marginTop: "10px",
                }}
              >
                Modelo
              </label>
              <input
                maxLength="100"
                type="text"
                className={getInputClass("modelo")}
                id="modelo"
                value={formData.modelo}
                onChange={handleChange}
                placeholder="Modelo"
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="tipoActivo"
                style={{
                  fontWeight: "bold",
                  marginBottom: "10px",
                  marginTop: "10px",
                }}
              >
                Tipo de Activo
              </label>
              <select
                className={getInputClass("tipoActivo")}
                id="tipoActivo"
                value={formData.tipoActivo}
                onChange={handleChange}
                style={{
                  padding: "5px",
                  borderRadius: "5px",
                  width: "100%",
                }}
              >
                <option value="">Seleccione el tipo de activo</option>
                <option value="informático">Informático</option>
                <option value="no informático">No Informático</option>
              </select>
            </div>

            <div className="form-group">
              <label
                htmlFor="procesoCompra"
                style={{
                  fontWeight: "bold",
                  marginBottom: "10px",
                  marginTop: "10px",
                }}
              >
                Proceso de compra
              </label>
              <input
                maxLength="100"
                type="text"
                className={getInputClass("procesoCompra")}
                id="procesoCompra"
                value={formData.procesoCompra}
                onChange={handleChange}
                placeholder="Proceso de compra"
              />
            </div>
            <div className="form-group">
              <label
                htmlFor="bloque"
                style={{
                  fontWeight: "bold",
                  marginBottom: "10px",
                  marginTop: "10px",
                }}
              >
                Bloque
              </label>
              <select
                className={getInputClass("bloque")}
                value={selectedBloque}
                onChange={handleBloqueChange}
                id="bloque"
              >
                <option value="">Seleccione un bloque</option>
                {bloques.map((bloque) => (
                  <option key={bloque.id_edificio} value={bloque.id_edificio}>
                    {bloque.nombre_edificio}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Columna 2 */}

          <div className="col-md-6">
            <div className="form-group">
              <label
                htmlFor="marca"
                style={{
                  fontWeight: "bold",
                  marginBottom: "10px",
                  marginTop: "10px",
                }}
              >
                Marca
              </label>
              <input
                maxLength="100"
                type="text"
                className={getInputClass("marca")}
                id="marca"
                value={formData.marca}
                onChange={handleChange}
                placeholder="Marca"
              />
            </div>
            <div className="form-group">
              <label
                htmlFor="numeroSerie"
                style={{
                  fontWeight: "bold",
                  marginBottom: "10px",
                  marginTop: "10px",
                }}
              >
                Número de serie
              </label>
              <input
                maxLength="50"
                type="text"
                className={getInputClass("numeroSerie")}
                id="numeroSerie"
                value={formData.numeroSerie}
                onChange={handleChange}
                placeholder="Número de serie"
              />
            </div>
            <div className="form-group">
              <label
                htmlFor="proveedor"
                style={{
                  fontWeight: "bold",
                  marginBottom: "10px",
                  marginTop: "10px",
                }}
              >
                Proveedor
              </label>
              <select
                className={getInputClass("proveedor")}
                value={selectedProveedor}
                onChange={handleChangeProveedor}
                id="proveedor"
              >
                <option value="">Seleccione un Proveedor</option>
                {proveedores.map((proveedor) => (
                  <option
                    key={proveedor.id_proveedor}
                    value={proveedor.id_proveedor}
                  >
                    {proveedor.nombre} {proveedor.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label
                htmlFor="laboratorio"
                style={{
                  fontWeight: "bold",
                  marginBottom: "10px",
                  marginTop: "10px",
                }}
              >
                Laboratorio
              </label>
              <select
                id="laboratorio"
                className={getInputClass("laboratorio")}
                value={selectedLaboratorio}
                onChange={handleLaboratorioChange}
                disabled={!selectedBloque} // Deshabilitar si no hay bloque seleccionado
              >
                <option value="">Seleccione un laboratorio</option>
                {laboratorios.map((laboratorio) => (
                  <option
                    key={laboratorio.id_laboratorio}
                    value={laboratorio.id_laboratorio}
                  >
                    {laboratorio.nombre_laboratorio}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label
            style={{
              fontWeight: "bold",
              marginBottom: "10px",
              marginTop: "10px",
            }}
          >
            Estado
          </label>
          <div className="d-flex gap-5">
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                id="nuevo"
                name="nuevo"
                value="Nuevo"
                onChange={handleEstadoChange}
                checked={formData.estado === "Nuevo"}
              />
              <label className="form-check-label" htmlFor="Nuevo">
                Nuevo
              </label>
            </div>
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                id="operando"
                name="operando"
                value="operando"
                onChange={handleEstadoChange}
                checked={formData.estado === "operando"}
              />
              <label className="form-check-label" htmlFor="operando">
                Operando
              </label>
            </div>
          </div>
        </div>
        {/* Especificaciones (Textbox) */}
        <div className="form-group">
          <label
            htmlFor="especificaciones"
            style={{
              fontWeight: "bold",
              marginBottom: "10px",
              marginTop: "10px",
            }}
          >
            Especificaciones
          </label>
          <textarea
            maxLength="500"
            className={getInputClass("especificaciones")}
            id="especificaciones"
            value={formData.especificaciones}
            onChange={handleChange}
            placeholder="Especificaciones"
            rows="3"
          ></textarea>
        </div>

        {/* Observaciones (Textbox) */}
        <div className="form-group">
          <label
            htmlFor="observaciones"
            style={{
              fontWeight: "bold",
              marginBottom: "10px",
              marginTop: "10px",
            }}
          >
            Observaciones
          </label>
          <textarea
            maxLength="500"
            className={getInputClass("observaciones")}
            id="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            placeholder="Observaciones"
            rows="3"
          ></textarea>
        </div>

        <div className="form-group">
          <label
            htmlFor="encargado"
            style={{
              fontWeight: "bold",
              marginBottom: "10px",
              marginTop: "10px",
            }}
          >
            Encargado
          </label>
          <select
            className={getInputClass("encargado")}
            value={selectedEncargado}
            onChange={handleChangeEncargado}
            id="encargado"
          >
            <option value="">Seleccione un Encargado</option>
            {encargados.map((laboratorista) => (
              <option key={laboratorista.cedula} value={laboratorista.cedula}>
                {laboratorista.nombre} {laboratorista.apellido}
              </option>
            ))}
          </select>
        </div>

        <div className="d-flex justify-content-between">
          <button type="submit" className="btn-principal text-white my-3">
            Guardar
          </button>
          <button
            type="button"
            className="btn-principal text-white my-3"
            onClick={closeModal}
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Aquí pasamos showModal y modalData como props al SuccessModal */}
      {showModal && (
        <SuccessModal titulo={modalData.titulo} mensaje={modalData.mensaje} />
      )}
      {showModalError && (
        <ErrorModal
          titulo={modalDataError.titulo}
          mensaje={modalDataError.mensaje}
        />
      )}
    </>
  );
}

FormularioActivo.propTypes = {
  closeModal: PropTypes.func.isRequired,
  agregarActivo: PropTypes.func.isRequired, // La propiedad titulo debe ser una funcion y es requerida
};

export default FormularioActivo;
