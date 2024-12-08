import axios from "axios";
import { useEffect, useState } from "react";

function FormularioActivo({ closeModal }) {
  const [encargados, setEncargados] = useState([]);
  const [selectedEncargado, setSelectedEncargado] = useState("");
  const [proveedores, setProveedores] = useState([]);
  const [selectedProveedor, setSelectedProveedor] = useState("");
  const [ubicaciones, setUbicaciones] = useState([]);
  const [selectedUbicacion, setSelectedUbicacion] = useState("");

  const [formData, setFormData] = useState({
    nombreActivo: "",
    modelo: "",
    marca: "",
    tipoActivo: "",
    numeroSerie: "",
    procesoCompra: "",
    proveedor: "",
    ubicacion: "",
    estado: "",
    especificaciones: "",
    observaciones: "",
    encargado: "",
  });

  // Función para manejar los cambios en los campos del formulario
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Función para manejar la selección del estado
  const handleEstadoChange = (e) => {
    setFormData({ ...formData, estado: e.target.value });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };
  const handleChangeEncargado = (e) => {
    setSelectedEncargado(e.target.value);
    // Establece el laboratorista seleccionado
    formData.encargado = e.target.value;
  };

  const handleChangeProveedor = (e) => {
    setSelectedProveedor(e.target.value);
    formData.proveedor = e.target.value;
  };

  const handleChangeUbicacion = (e) => {
    setSelectedUbicacion(e.target.value);
    formData.ubicacion = e.target.value;
  };

  useEffect(() => {
    // Hacer múltiples solicitudes en paralelo utilizando Promise.all
    Promise.all([
      axios.get("http://localhost:5000/laboratoristas"),
      axios.get("http://localhost:5000/proveedores"),
      axios.get("http://localhost:5000/ubicaciones"),
    ])
      .then(
        ([
          laboratoristasResponse,
          proveedoresResponse,
          ubicacionesResponse,
        ]) => {
          // Asigna los datos de las respuestas a sus respectivos estados
          setEncargados(laboratoristasResponse.data);
          setProveedores(proveedoresResponse.data);
          setUbicaciones(ubicacionesResponse.data);
        }
      )
      .catch((error) => {
        console.error("Hubo un error al obtener los datos:", error);
      });
  }, []);
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
            type="text"
            className="form-control"
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
                type="text"
                className="form-control"
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
              <input
                type="text"
                className="form-control"
                id="tipoActivo"
                value={formData.tipoActivo}
                onChange={handleChange}
                placeholder="Tipo de Activo"
              />
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
                type="text"
                className="form-control"
                id="procesoCompra"
                value={formData.procesoCompra}
                onChange={handleChange}
                placeholder="Proceso de compra"
              />
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
                type="text"
                className="form-control"
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
                type="text"
                className="form-control"
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
                className="form-control"
                value={selectedProveedor}
                onChange={handleChangeProveedor}
                id="proveedor"
              >
                <option value="">Seleccione un Proveedor</option>
                {/* Itera sobre el array de laboratoristas para crear un <option> por cada uno */}
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
          </div>
        </div>
        <div className="form-group">
          <label
            htmlFor="ubicacion"
            style={{
              fontWeight: "bold",
              marginBottom: "10px",
              marginTop: "10px",
            }}
          >
            Bloque y Laboratorio
          </label>
          <select
            className="form-control"
            value={selectedUbicacion}
            onChange={handleChangeUbicacion}
            id="ubicacion"
          >
            <option value="">Seleccione una ubicacion</option>
            {/* Itera sobre el array de laboratoristas para crear un <option> por cada uno */}
            {ubicaciones.map((ubicacion) => (
              <option
                key={ubicacion.id_ubicacion}
                value={ubicacion.id_ubicacion}
              >
                {ubicacion.nombre}
              </option>
            ))}
          </select>
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
                id="segundaMano"
                name="segundaMano"
                value="segundamano"
                onChange={handleEstadoChange}
                checked={formData.estado === "segundamano"}
              />
              <label className="form-check-label" htmlFor="SegundaMano">
                Segunda Mano
              </label>
            </div>
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                id="estado3"
                name="estado"
                value="Estado 3"
                onChange={handleEstadoChange}
                checked={formData.estado === "Estado 3"}
              />
              <label className="form-check-label" htmlFor="estado3">
                Estado 3
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
            className="form-control"
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
            className="form-control"
            id="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            placeholder="Observaciones"
            rows="3"
          ></textarea>
        </div>

        {/* Encargado (Input normal) */}
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
            className="form-control"
            value={selectedEncargado}
            onChange={handleChangeEncargado}
            id="encargado"
          >
            <option value="">Seleccione un Encargado</option>
            {/* Itera sobre el array de laboratoristas para crear un <option> por cada uno */}
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
    </>
  );
}

export default FormularioActivo;
