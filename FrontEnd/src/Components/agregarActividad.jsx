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

    // Verificación específica para "Cambio de Componentes"
    if (actividadSeleccionadaNombre === "Cambio de componentes") {
      const todosSonCPU = activosSeleccionados.every(
        (activo) => activo.tipo_activo === "CPU"
      );

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
    <div>
      <h4>Agregar Actividad</h4>
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
      <div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <label htmlFor="actividad">Selecciona una actividad:</label>
        <select
          id="actividad"
          value={actividadSeleccionada}
          onChange={(e) => {
            const selectedId = e.target.value; // ID seleccionado como string
            const selectedActividad = actividades.find(
              (actividad) => actividad.id.toString() === selectedId
            );
            setActividadSeleccionada(selectedId);
            setActividadSeleccionadaNombre(selectedActividad?.nombre || "");
          }}
        >
          <option value="">Seleccione una actividad</option>
          {actividades.map((actividad) => (
            <option key={actividad.id} value={actividad.id}>
              {actividad.nombre}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={handleAgregarActividad}
        style={{
          marginTop: "10px",
          backgroundColor: "#921c21",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Agregar Actividad
      </button>
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
      {mostrarFormulario && (
        <ActualizarComponentesModal
          formulariosActivos={formulariosActivos}
          onChangeComponent={handleChangeComponent}
          onSubmit={handleSubmitFormularios}
          onClose={() => setMostrarFormulario(false)}
          onGuardar={handleGuardar}
          idMantenimiento={idMantenimiento}
        />
      )}
    </div>
  );
}

export default AgregarActividad;
