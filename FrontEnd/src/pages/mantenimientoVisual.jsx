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
import TablaActivosMntenimientos from "../Components/TablaActivosMantenimientos";
import TablaActivosDetalleMantenimiento from "../Components/TablaActivosAgregarSinSelect";

function MantenimientoVisual() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mantenimiento, setMantenimiento] = useState(
    location.state?.mantenimiento ||
      JSON.parse(localStorage.getItem("mantenimiento"))
  );
  const hoy = new Date().toISOString().split("T")[0]; // Obtén la fecha actual en formato 'YYYY-MM-DD'
  const [reloadTable, setReloadTable] = useState(false);

  const [activoSeleccionado, setActivoSeleccionado] = useState(null);
  const [activosDispAgregar, setActivosDispAgregar] = useState([]);
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
  const [modoEdicion, setModoEdicion] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ titulo: "", mensaje: "" });
  const [showModalError, setShowModalError] = useState(false);
  const [modalDataError, setModalDataError] = useState({
    titulo: "",
    mensaje: "",
  });
  const [isDisabled, setIsDisabled] = useState(false);
  // Cargar activos disponibles al montar el componente
  useEffect(() => {
    axios
      .get("http://localhost:5000/activos-disponibles")
      .then((response) => setActivosDispAgregar(response.data))
      .catch((err) => {
        setModalDataError({
          titulo: "Error al cargar activos",
          mensaje: "No se pudo obtener la lista de activos disponibles.",
        });
        setShowModalError(true);
      });
  }, []);

  // Inicializar mantenimiento
  useEffect(() => {
    console.log(mantenimiento);

    if (!mantenimiento?.numero) {
      const savedMantenimiento = JSON.parse(
        localStorage.getItem("mantenimiento")
      );
      if (savedMantenimiento) {
        setMantenimiento(savedMantenimiento);
      } else {
        console.error("No se encontraron datos de mantenimiento.");
        navigate("/");
      }
    } else {
      localStorage.setItem("mantenimiento", JSON.stringify(mantenimiento));
    }
  }, [mantenimiento?.numero]);

  // Actualizar estados derivados de mantenimiento
  useEffect(() => {
    if (mantenimiento) {
      setFechaInicio(mantenimiento.inicio || ""); // Actualiza fechaInicio
    }
  }, [mantenimiento]);

  // Cargar activos asociados al mantenimiento
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

    fetchActivos();
  }, [id]);

  const handleFechaChange = (e) => {
    const nuevaFecha = e.target.value;
    if (nuevaFecha >= hoy) {
      setFechaFin(nuevaFecha);
      setEditableMantenimiento((prev) => ({
        ...prev,
        inicio: nuevaFecha, // Actualizar el valor de "fin"
      }));
    } else {
      if (nuevaFecha) {
        setModalDataError({
          titulo: "Fecha inválida",
          mensaje: "La fecha no puede ser anterior a la fecha actual",
        });
        setShowModalError(true);
      }
    }
  };
  const handleFechaFinChange = (e) => {
    const nuevaFecha = e.target.value;
    if (nuevaFecha >= hoy) {
      setFechaFin(nuevaFecha);
      setEditableMantenimiento((prev) => ({
        ...prev,
        fin: nuevaFecha, // Actualizar el valor de "fin"
      }));
    } else {
      if (nuevaFecha) {
        setModalDataError({
          titulo: "Fecha inválida",
          mensaje: "La fecha no puede ser anterior a la fecha actual",
        });
        setShowModalError(true);
      }
    }
  };
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
  const CerrarSesion = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  const selectAllActivos = (checked) => {
    setSelectedActivos(
      checked ? activos.map((activo) => activo.id_activo) : []
    );
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

  const columnasDetalle = [
    { header: "Código", render: (activo) => activo.numero_serie },
    { header: "Tipo", render: (activo) => activo.tipo },
    {
      header: "Fecha Registro",
      render: (activo) =>
        new Date(activo.fecha_registro).toISOString().split("T")[0],
    },
    { header: "Ubicación", render: (activo) => activo.ubicacion },
    { header: "Proveedor", render: (activo) => activo.proveedor },
    { header: "Clase", render: (activo) => activo.tipo_activo },
    {
      header: "Acciones",
      render: (activo) => (
        <>
          {/* Icono de visualización */}
          <i
            className="fas fa-eye"
            style={{
              color: "rgb(50, 50, 50)",
              cursor: "pointer",
              marginRight: "10px",
            }}
            onClick={() => verListaActividades(activo)}
          ></i>

          {/* Condicional para mostrar más íconos si el estado es "en proceso" */}
          {editableMantenimiento.estado === "en proceso" && (
            <>
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
        </>
      ),
    },
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
  const [encargados, setEncargados] = useState([]);
  const [tipoEncargado, setTipoEncargado] = useState(
    mantenimiento.cedula ? "laboratorista" : "externo"
  );

  // Cargar los encargados dependiendo del tipo seleccionado
  useEffect(() => {
    const url =
      tipoEncargado === "laboratorista"
        ? "http://localhost:5000/laboratoristas"
        : "http://localhost:5000/empresas_mantenimientos";

    axios
      .get(url)
      .then((response) => setEncargados(response.data))
      .catch((err) => {
        console.error("Error al cargar encargados:", err);
      });
  }, [tipoEncargado]); // Se ejecuta cuando cambia `tipoEncargado`

  const toggleModoEdicion = () => {
    setModoEdicion(!modoEdicion);
  };

  /*EDICION */

  const [editableMantenimiento, setEditableMantenimiento] = useState({
    ...mantenimiento,
  }); // Estado local para los datos editables
  const fechaActual = new Date().toISOString().split("T")[0]; // Formato 'YYYY-MM-DD'

  const guardarCambios = async () => {
    try {
      // Construir el objeto con los datos actualizados
      console.log(editableMantenimiento.fin, editableMantenimiento.inicio);

      const datosActualizados = {
        codigo: editableMantenimiento.codigo || null,
        fechaInicio: editableMantenimiento.inicio || null,
        fechaFin: editableMantenimiento.fin || fechaActual,
        tipo: editableMantenimiento.tipo || null,
        estado: editableMantenimiento.estado || null,
        cedula: editableMantenimiento.cedula || null, // Si es laboratorista
        ruc: editableMantenimiento.ruc || null, // Si es empresa
        descripcion: editableMantenimiento.descripcion || null,
      };
      if (editableMantenimiento.fin < editableMantenimiento.inicio) {
        setModalDataError({
          titulo: "Fechas invalidas",
          mensaje:
            "La fecha de finalización no puede ser anterior a la fecha de incio",
        });
        setShowModalError(true);
        setTimeout(() => {
          setShowModalError(false);
        }, 3000);
        return;
      }
      console.log(editableMantenimiento.fin);
      // Hacer la solicitud PUT al backend
      const response = await axios.put(
        `http://localhost:5000/mantenimientos/${editableMantenimiento.numero}`,
        datosActualizados
      );

      // Actualizar datos locales y mostrar modal de éxito
      //   setMantenimiento(editableMantenimiento);
      localStorage.setItem(
        "mantenimiento",
        JSON.stringify(editableMantenimiento)
      );
      setModoEdicion(false);
      setReloadTable((prev) => !prev);

      // Configurar datos y mostrar modal
      setModalData({
        titulo: "Cambios guardados con éxito",
        mensaje: "Los cambios se guardaron de manera exitosa.",
      });
      setShowModal(true);

      // Ocultar el modal después de 3 segundos
      setTimeout(() => {
        setShowModal(false);
      }, 3000);
    } catch (error) {
      console.error("Error al guardar los cambios:", error);

      // Configurar datos y mostrar modal de error
      setModalDataError({
        titulo: "Error al guardar los cambios:",
        mensaje: "Ocurrió un error durante la actualización de los datos.",
      });
      setShowModalError(true);

      // Ocultar el modal de error después de 3 segundos
      setTimeout(() => {
        setShowModalError(false);
      }, 3000);
    }
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
      <div
        className="container mt-4 p-4"
        style={{ backgroundColor: "#f9f9f9", borderRadius: "10px" }}
      >
        <h4
          className="mb-4 w-100"
          style={{ color: "#000000", fontWeight: "bold", textAlign: "center" }}
        >
          Detalle de Mantenimiento
        </h4>
        {/* Toggle Switch y Botón Guardar Cambios */}
        <div className="d-flex align-items-center mb-4">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="modoEdicionToggle"
              checked={modoEdicion} // Vinculado al estado
              onChange={toggleModoEdicion} // Cambiar estado al activarlo/desactivarlo
            />
            <label
              className="form-check-label ms-2"
              htmlFor="modoEdicionToggle"
            >
              {modoEdicion
                ? "Modo Edición Activado"
                : "Modo Edición Desactivado"}
            </label>
          </div>
          {modoEdicion && (
            <button
              className="btn  ms-3"
              style={{
                backgroundColor: "rgb(163, 33, 38)",
                color: "white",
                marginRight: "10px",
              }}
              onClick={guardarCambios}
            >
              Guardar Cambios
            </button>
          )}
        </div>

        <div className="row gy-3">
          {/* Código Mantenimiento */}
          <div className="col-md-3">
            <label className="form-label fw-bold">Código mantenimiento:</label>
            <p className="form-control bg-light">
              {editableMantenimiento.codigo}
            </p>
          </div>

          {/* Fecha Inicio */}
          <div className="col-md-3">
            <label className="form-label fw-bold">Fecha Inicio:</label>
            <input
              type="date"
              className="form-control"
              value={editableMantenimiento.inicio || ""} // Usar "inicio"
              onChange={handleFechaChange} // Llamada directa a la función
              min={hoy} // Configura el valor mínimo permitido
              disabled={!modoEdicion}
            />
          </div>

          {/* Fecha Fin */}
          <div className="col-md-3">
            <label className="form-label fw-bold">Fecha Fin:</label>
            <input
              type="date"
              className="form-control"
              value={editableMantenimiento.fin || ""} // Usar "fin"
              onChange={handleFechaFinChange} // Llamada directa a la función
              disabled={!modoEdicion}
              min={hoy} // Configura el valor mínimo permitido
            />
          </div>

          {/* Tipo Mantenimiento */}
          <div className="col-md-3">
            <label className="form-label fw-bold">Tipo Mantenimiento:</label>
            <select
              className="form-select"
              value={editableMantenimiento.tipo || ""}
              onChange={(e) =>
                setEditableMantenimiento((prev) => ({
                  ...prev,
                  tipo: e.target.value,
                }))
              }
              disabled={!modoEdicion}
            >
              <option value="preventivo">Preventivo</option>
              <option value="correctivo">Correctivo</option>
            </select>
          </div>

          {/* Entidad Encargada */}
          <div className="col-md-3">
            <label className="form-label fw-bold">Entidad Encargada:</label>
            <select
              className="form-select"
              value={tipoEncargado}
              onChange={(e) => {
                const nuevoTipo = e.target.value;
                setTipoEncargado(nuevoTipo);
                setEditableMantenimiento((prev) => ({
                  ...prev,
                  cedula: nuevoTipo === "laboratorista" ? "" : null,
                  ruc: nuevoTipo === "externo" ? "" : null,
                }));
              }}
              disabled={!modoEdicion}
            >
              <option value="laboratorista">Laboratorista</option>
              <option value="externo">Externo</option>
            </select>
          </div>

          {/* Responsable */}
          <div className="col-md-3">
            <label className="form-label fw-bold">Responsable:</label>
            <select
              className="form-select"
              value={
                tipoEncargado === "laboratorista"
                  ? editableMantenimiento.cedula || ""
                  : editableMantenimiento.ruc || ""
              }
              onChange={(e) => {
                const nuevoResponsable = e.target.value;
                setEditableMantenimiento((prev) => ({
                  ...prev,
                  cedula:
                    tipoEncargado === "laboratorista" ? nuevoResponsable : null,
                  ruc: tipoEncargado === "externo" ? nuevoResponsable : null,
                }));
              }}
              disabled={!modoEdicion}
            >
              <option value="" disabled>
                Seleccione un responsable
              </option>
              {encargados.map((encargado) => (
                <option
                  key={encargado.id}
                  value={encargado.cedula || encargado.ruc}
                >
                  {encargado.nombre} {encargado.apellido || ""}
                </option>
              ))}
            </select>
          </div>

          {/* Estado Mantenimiento */}
          <div className="col-md-3">
            <label className="form-label fw-bold">Estado Mantenimiento:</label>
            <select
              className="form-select"
              value={editableMantenimiento.estado || ""}
              onChange={(e) =>
                setEditableMantenimiento((prev) => ({
                  ...prev,
                  estado: e.target.value,
                }))
              }
              disabled={!modoEdicion}
            >
              <option value="en proceso">En Proceso</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>

          {/* Descripción */}
          <div className="col-md-12">
            <label className="form-label fw-bold">Descripción:</label>
            <textarea
              className="form-control"
              rows="3"
              value={editableMantenimiento.descripcion || ""}
              onChange={(e) =>
                setEditableMantenimiento((prev) => ({
                  ...prev,
                  descripcion: e.target.value,
                }))
              }
              disabled={!modoEdicion}
            ></textarea>
          </div>
        </div>
      </div>

      <div
        style={{
          marginBottom: "20px",
          alignItems: "center",
          marginLeft:"150px",
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
      <div style={{ width: "90%", margin: "auto", marginBottom: "40px" }}>
        <TablaActivosDetalleMantenimiento
          activos={activos}
          columnas={columnasDetalle}
          filtrosConfig={filtrosConfig}
        ></TablaActivosDetalleMantenimiento>
      </div>
      {/*<div style={{ margin: "20px auto", maxWidth: "80%", marginTop: "-10px" }}>
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
                        {activo.estado_mantenimiento === "en proceso" && (
                          <>
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
                      </>
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
      </div>*/}

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
              style={{
                maxWidth: "1300px",
                maxHeight: "1000px",
              }}
            >
              <div className="modal-content">
                <div className="modal-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">Agregar Activos Al Mantenimiento</h4>
                    <span
                      className="close"
                      style={{
                        fontSize: "2rem",
                        cursor: "pointer",
                        fontWeight: "bold",
                        color: "#921c21",
                      }}
                      onClick={cerrarListado}
                    >
                      &times;
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-4"></div>
                  {/*<ListadoActivo
                    closeModal={cerrarListado}
                    idMantenimiento={id}
                  />*/}
                  <TablaActivosMntenimientos
                    activos={activosDispAgregar}
                    selectedActivos={selectedActivos}
                    onSelectedActivosChange={handleSelectActivo}
                    columnas={columnas}
                    filtrosConfig={filtrosConfig}
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
