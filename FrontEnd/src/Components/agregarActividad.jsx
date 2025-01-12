import React, { useState, useEffect } from "react";
import axios from "axios";
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";
import ActualizarComponentesModal from "./ActualizarComponentesModal";

function AgregarActividad({
  activosSeleccionados,
  closeModal,
  idMantenimiento,
}) {
  const [actividades, setActividades] = useState([]);
  const [actividadSeleccionada, setActividadSeleccionada] = useState("");
  const [actividadSeleccionadaNombre, setActividadSeleccionadaNombre] =
    useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulariosActivos, setFormulariosActivos] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ titulo: "", mensaje: "" });
  const [showModalError, setShowModalError] = useState(false);
  const [modalDataError, setModalDataError] = useState({
    titulo: "",
    mensaje: "",
  });

  useEffect(() => {
    // Consultar actividades disponibles
    console.log(activosSeleccionados);
    const cargarActividades = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/consultarActividades"
        );
        setActividades(response.data);
      } catch (err) {
        console.error("Error al cargar actividades:", err);
        setError("Error al cargar actividades");
      }
    };

    cargarActividades();
  }, []);

  const resetModalStates = () => {
    setShowModal(false);
    setShowModalError(false);
    setModalData({ titulo: "", mensaje: "" });
    setModalDataError({ titulo: "", mensaje: "" });
  };

  const obtenerComponentesActuales = async (idActivo) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/componentesActuales",
        { id: idActivo }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error al obtener los componentes del activo ${idActivo}:`,
        error
      );
      return [];
    }
  };

  const handleAgregarActividad = async () => {
    setError("");

    // Validaciones iniciales
    if (!actividadSeleccionada) {
      setModalDataError({
        titulo: "Error de Validación",
        mensaje: "Debe seleccionar una actividad",
      });
      setShowModalError(true);
      setTimeout(() => {
        setShowModalError(false);
      }, 3000);
      return;
    }

    if (!activosSeleccionados || activosSeleccionados.length === 0) {
      setModalDataError({
        titulo: "Error de Validación",
        mensaje: "Debe seleccionar al menos un activo.",
      });
      setShowModalError(true);
      setTimeout(() => {
        setShowModalError(false);
      }, 3000);
      return;
    }

    if (actividadSeleccionadaNombre === "Cambio de componentes") {
      const todosSonCPU = activosSeleccionados.tipo_activo === "CPU";
      if (!todosSonCPU) {
        setModalDataError({
          titulo: "Error de Validación",
          mensaje:
            "Para seleccionar 'Cambio de Componentes', todos los activos deben ser de tipo CPU.",
        });
        setShowModalError(true);
        setTimeout(() => {
          setShowModalError(false);
        }, 3000);
        return;
      }

      // Obtener componentes actuales para cada activo
      const formularios = await Promise.all(
        activosSeleccionados.map(async (activo) => {
          const componentesActuales = await obtenerComponentesActuales(
            activo.id_activo
          );
          return {
            idActivo: activo.id_activo,
            componentesActuales,
            nuevosComponentes: {},
          };
        })
      );

      setFormulariosActivos(formularios);
      setMostrarFormulario(true);

      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/insertarActividad",
        {
          idActivos: activosSeleccionados,
          idActividad: actividadSeleccionada,
          idMantenimiento: idMantenimiento,
        }
      );

      if (
        response.data.message ===
        "Las actividades se agregaron con éxito a los activos."
      ) {
        setModalData({
          titulo: "Actividad Agregada",
          mensaje: "La actividad se agregó con éxito.",
        });
        setShowModal(true);

        setTimeout(() => {
          setShowModal(false);
          closeModal();
        }, 3000);
      } else {
        setModalDataError({
          titulo: "Error al agregar la actividad",
          mensaje: "No se pudo agregar la actividad.",
        });
        setShowModalError(true);
        setTimeout(() => {
          setShowModalError(false);
          closeModal();
        }, 3000);
      }
    } catch (err) {
      console.error("Error al agregar actividad:", err);
      setError("Error al agregar la actividad.");
    }
  };
  const handleEliminarActividad = (actividadId) => {
    setActividadesSeleccionadas((prevState) =>
      prevState.filter((actividad) => actividad.id !== actividadId)
    );
  };
  const handleChangeComponent = (e, idActivo, tipoComponente) => {
    setFormulariosActivos((prev) =>
      prev.map((form) =>
        form.idActivo === idActivo
          ? {
              ...form,
              nuevosComponentes: {
                ...form.nuevosComponentes,
                [tipoComponente]: e.target.value,
              },
            }
          : form
      )
    );
  };

  const handleSubmitFormularios = async () => {
    setMostrarFormulario(false);
    try {
      console.log("Datos enviados al backend:", {
        idActivos: activosSeleccionados.map((activo) => activo.id_activo), // Extrae solo los IDs
        idActividad: actividadSeleccionada,
      });
      const response = await axios.post(
        "http://localhost:5000/insertarActividad",
        {
          idActivos: activosSeleccionados.map((activo) => activo.id_activo),
          idActividad: actividadSeleccionada,
          idMantenimiento: idMantenimiento,
        }
      );

      if (
        response.data.message ===
        "Las actividades se agregaron con éxito a los activos."
      ) {
        setModalData({
          titulo: "Actividad Agregada",
          mensaje: "La actividad se agregó con éxito.",
        });
        setShowModal(true);

        setTimeout(() => {
          setShowModal(false);
          closeModal();
          window.location.reload();
        }, 3000);
      } else {
        setModalDataError({
          titulo: "Error al agregar la actividad",
          mensaje: "No se pudo agregar la actividad.",
        });
        setShowModalError(true);
        setTimeout(() => {
          setShowModalError(false);
          closeModal();
        }, 3000);
      }
    } catch (err) {
      console.error("Error al agregar actividad:", err);
      setError("Error al agregar la actividad.");
    }
  };

  const handleGuardar = (data) => {
    console.log("Componentes guardados:", data);
    // Aquí puedes enviar los datos a la API o realizar otra acción
  };
  return (
    <div
      style={{
        justifyContent: "center", // Centra horizontalmente
        marginTop: "10px", // Espaciado adicional si lo necesitas
        display: "flex",
        flexDirection: "column", // Organiza los elementos en columna
        alignItems: "center", // Centra el contenido horizontalmente
        position: "relative", // Necesario para posicionar el botón en la esquina
      }}
    >
      <h4
        style={{
          fontWeight: "bold",
          color: "black",
          textAlign: "center",
        }}
      >
        Asignación de Actividades
      </h4>

      <span
        className="close"
        style={{
          fontSize: "2rem",
          cursor: "pointer",
          fontWeight: "bold",
          color: "#921c21",
          position: "absolute",
          top: "10px",
          right: "10px",
        }}
        onClick={() => console.log("Modal cerrado")}
      >
        &times;
      </span>

      <div
        style={{
          marginTop: "20px",
          marginLeft: "65px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <p>
          <strong>Numero de Serie:</strong> {activosSeleccionados.numero_serie}
        </p>
        <p>
          <strong>Activo:</strong> {activosSeleccionados.tipo_activo}
        </p>
        <p>
          <strong>Marca:</strong> {activosSeleccionados.marca}
        </p>
        <p>
          <strong>Modelo:</strong> {activosSeleccionados.modelo}
        </p>
      </div>

      {/* Colocando el select a la izquierda */}
      <div
        style={{
          marginTop: "20px",
          width: "100%",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <select
          id="actividad"
          value={actividadSeleccionada}
          onChange={(e) => setActividadSeleccionada(e.target.value)}
          style={{ padding: "8px", fontSize: "1rem" }}
        >
          <option value="">Seleccione una actividad</option>
          {actividades.map((actividad) => (
            <option key={actividad.id} value={actividad.id}>
              {actividad.nombre}
            </option>
          ))}
        </select>

        {/* Recuadro para mostrar las actividades seleccionadas */}
        <div
          style={{
            marginLeft: "20px",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            minWidth: "300px",
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "flex-start",
          }}
        >
          {actividadesSeleccionadas.length === 0 ? (
            <span>Selecciona actividades</span>
          ) : (
            actividadesSeleccionadas.map((actividad) => (
              <div
                key={actividad.id}
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "5px 10px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {actividad.nombre}
                <span
                  onClick={() => handleEliminarActividad(actividad.id)}
                  style={{
                    cursor: "pointer",
                    marginLeft: "8px",
                    color: "red",
                    fontWeight: "bold",
                  }}
                >
                  &times;
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <button
        onClick={handleAgregarActividad}
        style={{
          marginTop: "10px",
          backgroundColor: "#921c21",
          color: "white",
          padding: "7px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "20px", // Ajusta el espaciado en la parte inferior si es necesario
        }}
      >
        Agregar Actividad
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default AgregarActividad;
