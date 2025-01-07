import axios from "axios";
import { useEffect, useState } from "react";
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";
import PropTypes from "prop-types";
import Componentes from "./componentes";

function FormularioActivo({
  closeModal,
  agregarActivo,
  activoTabla,
  esEdicion,
  actualizarActivo,
  recargarTabla,
}) {
  const [activos, setActivos] = useState([]); // Estado para los activos
  const [selectedActivo, setSelectedActivo] = useState(""); // Estado para el activo seleccionado
  const [marcas, setMarcas] = useState([]); // Estado para las marcas
  const [modelos, setModelos] = useState([]); // Estado para los modelos
  const [selectedMarca, setSelectedMarca] = useState(""); // Marca seleccionada
  const [selectedModelo, setSelectedModelo] = useState(""); // Modelo seleccionado
  const [errorKey, setErrorKey] = useState(0); // Estado para forzar la re-renderización del modal
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
  const [detallesComponentes, setDetallesComponentes] = useState({
    procesador: "",
    ram: "",
    disco: "",
    grafica: "",
    fuente: "",
  });
  const [esCPU, setEsCPU] = useState(false); // Determina si el activo es CPU

  const [modalDataError, setModalDataError] = useState({
    titulo: "",
    mensaje: "",
  });

  const [formData, setFormData] = useState({
    activo: "",
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
    activo: false,
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
  function capitalizeFirstLetter(str) {
    if (!str) return ""; // Manejar cadenas vacías
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModalError(false);
    // Validar campos requeridos
    const newErrors = {};
    let fieldsAreEmpty = false;

    Object.keys(formData).forEach((key) => {
      const value = formData[key];

      // Caso específico: Validación del campo "especificaciones"

      if (key === "especificaciones" && esCPU) {
        console.log("Saltando validacion");
        newErrors[key] = false; // Campo no es obligatorio
        return; // Salir de esta iteración
      }

      // Si no es CPU, validar el contenido del campo "especificaciones"
      if (!value || (typeof value === "string" && value.trim() === "")) {
        newErrors[key] = true; // Campo vacío
        fieldsAreEmpty = true;
      } else {
        newErrors[key] = false;
      }

      // Validación general para los demás campos
      if (!value || (typeof value === "string" && value.trim() === "")) {
        newErrors[key] = true; // Campo vacío
        fieldsAreEmpty = true;
      } else {
        newErrors[key] = false;
      }
    });
    // Validar campos del componente `Componentes` solo si es CPU
    if (esCPU && !esEdicion) {
      console.log("Validando componentes porque es CPU.");
      Object.entries(detallesComponentes).forEach(([key, value]) => {
        if (!value || value.trim() === "") {
          console.log(`Componente vacío detectado: ${key}`);
          newErrors[key] = true;
          fieldsAreEmpty = true;
        } else {
          newErrors[key] = false;
        }
      });
    } else {
      // Asegúrate de que los errores relacionados con componentes no se marquen si no es CPU
      Object.keys(detallesComponentes).forEach((key) => {
        newErrors[key] = false;
      });
    }

    // Validación del estado (debe ser un valor)
    if (formData.estado === "") {
      newErrors.estado = true;
      fieldsAreEmpty = true;
    } else {
      newErrors.estado = false;
    }

    setErrors(newErrors);
    console.log("Final newErrors object:", newErrors);
    console.log("fieldsAreEmpty:", fieldsAreEmpty);
    // Mostrar modal si hay campos vacíos
    if (fieldsAreEmpty) {
      setModalDataError({
        titulo: "Campos vacíos",
        mensaje: "Por favor, complete todos los campos requeridos.",
      });
      setShowModalError(true); // Mostrar el modal de error
      setErrorKey((prevKey) => prevKey + 1);
      return; // No enviar el formulario
    }

    // Construir los datos que quieres enviar al backend
    const dataToSend = {
      numeroSerie: formData.numeroSerie,
      procesoCompra: formData.procesoCompra,
      estado: formData.estado,
      tipo: formData.tipoActivo,
      especificaciones: formData.especificaciones,
      observaciones: formData.observaciones,
      id_proveedor: selectedProveedor,
      id_laboratorio: selectedLaboratorio,
      id_ubicacion: selectedBloque,
      id_modelo: selectedModelo,
      id_laboratorista: selectedEncargado,
      componentes: esCPU ? Object.values(detallesComponentes) : [],
    };

    if (esEdicion) {
      // Actualizar activo
      axios
        .put(
          `http://localhost:5000/actualizarActivo/${activoTabla.id_activo}`,
          dataToSend
        )
        .then((response) => {
          console.log("Activo actualizado:", response.data);
          actualizarActivo(response.data); // Actualiza la lista de activos
          recargarTabla(); // Recarga la tabla de activos
          setModalData({
            titulo: "¡Operación Exitosa!",
            mensaje: "El activo se ha Actualizado correctamente.",
          });
          setShowModal(true); // Mostrar el modal de éxito
          setShowModalError(false); // Ocultar el modal de error
          // Cerrar el formulario después de mostrar el mensaje
          setTimeout(() => {
            setShowModal(false); // Oculta el modal de éxito
            closeModal(); // Cierra el formulario
          }, 2000); // 2 segundos de espera
        })
        .catch((error) => {
          if (error.response.status === 500) {
            setModalDataError({
              titulo: "Error al registrar",
              mensaje:
                "El identificador de activo ya existe. Inténtalo de nuevo.",
            });
          } else {
            //console.error("Error al guardar el activo:", error);
            // Si hay un error, muestra el modal de error
            setModalDataError({
              titulo: "Error al registrar",
              mensaje: "Error al registrar el activo. Inténtalo de nuevo.",
            });
          }
          setShowModalError(true); // Mostrar el modal de error
          setErrorKey((prevKey) => prevKey + 1); // Ocultar el modal de éxito
        });
    } else {
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
            numeroSerie: "",
            procesoCompra: "",
            estado: "",
            especificaciones: "",
            observaciones: "",
            id_proveedor: "",
            id_laboratorio: "",
            id_ubicacion: "",
            id_modelo: "",
            id_laboratorista: "",
          });
        })
        .catch((error) => {
          if (error.response.status === 500) {
            setModalDataError({
              titulo: "Error al registrar",
              mensaje:
                "El identificador de activo ya existe. Inténtalo de nuevo.",
            });
          } else {
            //console.error("Error al guardar el activo:", error);
            // Si hay un error, muestra el modal de error
            setModalDataError({
              titulo: "Error al registrar",
              mensaje: "Error al registrar el activo. Inténtalo de nuevo.",
            });
          }
          setShowModalError(true); // Mostrar el modal de error
          setErrorKey((prevKey) => prevKey + 1); // Ocultar el modal de éxito
        });
    }
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
      axios.get("http://localhost:5000/tiposActivos"),
    ])
      .then(
        ([
          laboratoristasResponse,
          proveedoresResponse,
          edificiosResponse,
          tipoActivosResponse,
        ]) => {
          // Asigna los datos de las respuestas a sus respectivos estados
          setEncargados(laboratoristasResponse.data);
          setProveedores(proveedoresResponse.data);
          setBloques(edificiosResponse.data);
          setActivos(tipoActivosResponse.data);
          //console.log("Datos obtenidos:", tipoActivosResponse.data);
        }
      )
      .catch((error) => {
        console.error("Hubo un error al obtener los datos:", error);
      });
  }, []);

  // Precarga los datos si se recibe un activo
  useEffect(() => {
    if (activoTabla) {
      console.log("Activos Tabla", activoTabla);
      setEsCPU(activoTabla.nombre_activo?.toLowerCase() === "cpu");

      setFormData({
        numeroSerie: activoTabla.numero_serie || "",
        procesoCompra: activoTabla.proceso_compra || "",
        estado: activoTabla.estado || "",
        especificaciones: activoTabla.especificaciones || " ",
        observaciones: activoTabla.observaciones || "",
        id_tipo: activoTabla.id_tipo || "",
        id_proveedor: activoTabla.id_proveedor || "",
        id_laboratorio: activoTabla.id_laboratorio || "",
        id_ubicacion: activoTabla.id_ubicacion || "",
        id_modelo: activoTabla.id_modelo || "",
        id_laboratorista: activoTabla.id_laboratorista || "",
        tipoActivo: capitalizeFirstLetter(activoTabla.tipo_activo) || "",
      });
      // Actualiza los estados específicos para los combobox
      setSelectedActivo(activoTabla.id_tipo || "");
      setSelectedProveedor(activoTabla.id_proveedor || "");
      setSelectedLaboratorio(activoTabla.id_laboratorio || "");
      setSelectedBloque(activoTabla.id_ubicacion || "");
      setSelectedModelo(activoTabla.id_modelo || "");
      setSelectedMarca(activoTabla.id_marca || "");
      setSelectedEncargado(activoTabla.id_laboratorista || "");

      // Cargar opciones dinámicas para combobox anidados
      if (activoTabla.id_ubicacion) {
        fetchLaboratorios(activoTabla.id_ubicacion); // Cargar laboratorios asociados al bloque
      }
      if (activoTabla.id_tipo) {
        fetchMarcas(activoTabla.id_tipo); // Cargar marcas asociadas al tipo activo
      }
      if (activoTabla.id_marca) {
        fetchModelos(activoTabla.id_marca, activoTabla.id_tipo); // Cargar modelos asociados a la marca
      }
    }
  }, [activoTabla]);

  const fetchLaboratorios = (idBloque) => {
    axios
      .get(`http://localhost:5000/laboratorios/${idBloque}`)
      .then((response) => {
        setLaboratorios(response.data); // Actualizar lista de laboratorios
      })
      .catch((error) => {
        console.error("Error al obtener laboratorios:", error);
      });
  };

  const fetchMarcas = (idTipo) => {
    axios
      .get(`http://localhost:5000/marcas/${idTipo}`)
      .then((response) => {
        setMarcas(response.data); // Actualizar lista de marcas
      })
      .catch((error) => {
        console.error("Error al obtener marcas:", error);
      });
  };

  const fetchModelos = (idMarca, idTipo) => {
    axios
      .get("http://localhost:5000/modelos", {
        params: { idMarca, idTipo },
      })
      .then((response) => {
        setModelos(response.data);
        console.log("Modelos obtenidos:", response.data);
      })
      .catch((error) => {
        console.error("Error al obtener los modelos:", error);
      });
  };

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
      fetchLaboratorios(idEdificio);
    } else {
      setLaboratorios([]); // Si no hay bloque seleccionado, limpiar los laboratorios
    }
  };
  // Manejar el cambio en el laboratorio seleccionado
  const handleLaboratorioChange = (e) => {
    setSelectedLaboratorio(e.target.value);
    formData.laboratorio = e.target.value; // Establecer el laboratorio seleccionado
  };

  // Manejar el cambio en el activo seleccionado
  const handleActivoChange = (e) => {
    const activoId = e.target.value;
    setSelectedActivo(activoId);
    formData.activo = activoId;

    // Verificar si el tipo de activo es CPU y actualizar el estado
    const activoSeleccionado = activos.find(
      (activo) => activo.id_tipo === parseInt(activoId)
    );
    setEsCPU(
      activoSeleccionado && activoSeleccionado.nombre.toLowerCase() === "cpu"
    );

    // Llamada a la API para obtener marcas relacionadas con el activo
    axios
      .get(`http://localhost:5000/marcas/${activoId}`) // Endpoint para obtener marcas por activo
      .then((response) => {
        setMarcas(response.data); // Actualizar marcas en el estado
        setModelos([]); // Limpiar modelos al cambiar el activo
      })
      .catch((error) => {
        console.error("Error al obtener marcas:", error);
      });
  };

  // Manejar el cambio en la marca seleccionada
  const handleMarcaChange = (e) => {
    const marcaId = e.target.value;
    setSelectedMarca(marcaId);
    formData.marca = marcaId;
    console.log("Marca seleccionada:", marcaId);
    console.log("Activo seleccionado:", selectedActivo);

    // Llamada a la API para obtener modelos relacionados con la marca
    axios
      .get("http://localhost:5000/modelos", {
        params: {
          idMarca: marcaId,
          idTipo: selectedActivo,
        },
      })
      .then((response) => {
        setModelos(response.data); // Actualizar modelos en el estado
        console.log("Modelos obtenidos:", response.data);
      })
      .catch((error) => {
        console.error("Error al obtener los modelos:", error);
      });
  };

  // Manejar el cambio en el modelo seleccionado
  const handleModeloChange = (e) => {
    const modeloId = e.target.value;
    setSelectedModelo(modeloId);
    formData.modelo = modeloId;
  };
  const handleChangeComponent = (e, id) => {
    const { value } = e.target;

    setDetallesComponentes((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };
  return (
    <>
      <div className="d-flex justify-content-between text-center align-items-center mb-4">
        <h5 className="modal-title">
          {esEdicion ? "Editar Activo" : "Registrar Nuevo Activo"}
        </h5>
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
            htmlFor="activo"
            style={{
              fontWeight: "bold",
              marginBottom: "10px",
              marginTop: "10px",
              marginRight: "20px",
            }}
          >
            Activo
          </label>
          <select
            className={getInputClass("activo")}
            value={selectedActivo}
            onChange={handleActivoChange}
            id="activo"
            disabled={esEdicion}
          >
            <option value="">Seleccione un activo</option>
            {activos.map((activo) => (
              <option key={activo.id_tipo} value={activo.id_tipo}>
                {activo.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* COMBO BOX TIPO ACTIVO */}

        <div className="row">
          {/* Columna 1 */}
          <div className="col-md-6">
            <div className="form-group">
              <label
                htmlFor="marca"
                style={{
                  fontWeight: "bold",
                  marginRight: "20px",
                  marginTop: "10px",
                  marginBottom: "10px",
                }}
              >
                Marca
              </label>
              <select
                className={getInputClass("marca")}
                value={selectedMarca}
                onChange={handleMarcaChange}
                id="marca"
              >
                <option value="">Seleccione una marca</option>
                {marcas.map((marca) => (
                  <option key={marca.id_marca} value={marca.id_marca}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
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
                value={capitalizeFirstLetter(formData.tipoActivo)}
                onChange={handleChange}
                style={{
                  padding: "5px",
                  borderRadius: "5px",
                  width: "100%",
                }}
              >
                <option value="">Seleccione el tipo de activo</option>
                <option value="Informático">Informático</option>
                <option value="No informático">No Informático</option>
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
                value={capitalizeFirstLetter(formData.procesoCompra)}
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
                htmlFor="modelo"
                style={{
                  fontWeight: "bold",
                  marginRight: "20px",
                  marginTop: "10px",
                  marginBottom: "10px",
                }}
              >
                Modelo
              </label>
              <select
                className={getInputClass("modelo")}
                value={selectedModelo}
                onChange={handleModeloChange}
                id="modelo"
              >
                <option value="">Seleccione un modelo</option>
                {modelos.map((modelo) => (
                  <option key={modelo.id_modelo} value={modelo.id_modelo}>
                    {modelo.nombre}
                  </option>
                ))}
              </select>
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
                value={formData.numeroSerie.toUpperCase()}
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
                value="Operando"
                onChange={handleEstadoChange}
                checked={formData.estado === "Operando"}
              />
              <label className="form-check-label" htmlFor="operando">
                Operando
              </label>
            </div>
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                id="proceso_instalacion"
                name="proceso_instalacion"
                value="En proceso de instalación"
                onChange={handleEstadoChange}
                checked={formData.estado === "En proceso de instalación"}
              />
              <label className="form-check-label" htmlFor="proceso_instalacion">
                En proceso de instalación
              </label>
            </div>
          </div>
        </div>

        <div className="form-group">
          {/* Mostrar Especificaciones si NO es CPU y estamos en modo edición */}
          {!esCPU && esEdicion && (
            <>
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
                value={capitalizeFirstLetter(formData.especificaciones)}
                onChange={handleChange}
                placeholder="Especificaciones"
                rows="3"
              ></textarea>
            </>
          )}
          {!esCPU && !esEdicion && (
            <>
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
                value={capitalizeFirstLetter(formData.especificaciones)}
                onChange={handleChange}
                placeholder="Especificaciones"
                rows="3"
              ></textarea>
            </>
          )}

          {/* Mostrar el componente dinámico si es CPU y NO estamos en modo edición */}
          {esCPU && !esEdicion && (
            <Componentes
              handleChangeComponent={handleChangeComponent}
              getInputClass={(field) => getInputClass(field)}
            />
          )}
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
            value={capitalizeFirstLetter(formData.observaciones)}
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
          <button
            type="button"
            className="btn-principal text-white my-3"
            onClick={closeModal}
          >
            Cancelar
          </button>
          <button type="submit" className="btn-principal text-white my-3">
            Guardar
          </button>
        </div>
      </form>

      {/* Aquí pasamos showModal y modalData como props al SuccessModal */}
      {showModal && (
        <SuccessModal titulo={modalData.titulo} mensaje={modalData.mensaje} />
      )}
      {showModalError && (
        <ErrorModal
          key={errorKey}
          titulo={modalDataError.titulo}
          mensaje={modalDataError.mensaje}
        />
      )}
    </>
  );
}

FormularioActivo.propTypes = {
  actualizarActivo: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  agregarActivo: PropTypes.func.isRequired, // La propiedad titulo debe ser una funcion y es requerida
  recargarTabla: PropTypes.func.isRequired,
  activoTabla: PropTypes.shape({
    // El objeto activo, opcional
    id_activo: PropTypes.number,
    numero_serie: PropTypes.string,
    proceso_compra: PropTypes.string,
    estado: PropTypes.string,
    especificaciones: PropTypes.string,
    observaciones: PropTypes.string,
    id_proveedor: PropTypes.number,
    id_laboratorio: PropTypes.number,
    id_ubicacion: PropTypes.number,
    id_modelo: PropTypes.number,
    id_marca: PropTypes.number,
    id_laboratorista: PropTypes.string,
    tipo_activo: PropTypes.string,
    id_tipo: PropTypes.number,
    nombre_activo: PropTypes.string,
  }),
  esEdicion: PropTypes.bool,
};

export default FormularioActivo;
