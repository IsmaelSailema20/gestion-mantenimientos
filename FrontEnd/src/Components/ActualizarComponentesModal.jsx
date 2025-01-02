import React, { useState } from "react";
import Modal from "react-modal";
import Componentes from "./componentes";
import axios from "axios";
import { TextField } from "@mui/material";
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";
function ActualizarComponentesModal({
  formulariosActivos,
  onSubmit,
  onClose,
  idMantenimiento,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [observaciones, setObservaciones] = useState("");
  const [modalData, setModalData] = useState({ titulo: "", mensaje: "" });
  const [showModalError, setShowModalError] = useState(false);
  const [modalDataError, setModalDataError] = useState({
    titulo: "",
    mensaje: "",
  });
  const [showModal, setShowModal] = useState(false);

  // Manejar el cambio en el TextField
  const handleObservacionesChange = (event) => {
    setObservaciones(event.target.value);
  };
  // Crear un estado independiente para cada formulario
  const [updatedFormularios, setUpdatedFormularios] = useState(
    formulariosActivos.map((formulario) => ({
      ...formulario,
      nuevosComponentes: formulario.nuevosComponentes || {}, // Inicializar nuevosComponentes si no existe
    }))
  );

  const handleComponentChange = (e, tipoComponente) => {
    const value = e.target.value;

    // Actualizar solo el formulario actual
    setUpdatedFormularios((prevFormularios) =>
      prevFormularios.map((formulario, index) =>
        index === currentIndex
          ? {
              ...formulario,
              nuevosComponentes: {
                ...formulario.nuevosComponentes,
                [tipoComponente]: value, // Actualizar solo el componente específico
              },
            }
          : formulario
      )
    );
  };

  const handleSave = async () => {
    const currentForm = updatedFormularios[currentIndex];

    const componentesSeleccionados = Object.values(
      currentForm.nuevosComponentes
    ).filter((componente) => componente !== "");

    if (componentesSeleccionados.length <5) {
      setModalDataError({
        titulo: "Error de Validación",
        mensaje: "Debe seleccionar todos los componentes que tendrá el activo",
      });
      setShowModalError(true);
      setTimeout(() => {
        setShowModalError(false);
      }, 3000);
      return;
    } else {
    }

    console.log(currentForm.idActivo + " " + idMantenimiento);
    console.log(currentForm.nuevosComponentes);
    try {
      await axios.post("http://localhost:5000/guardarcomponentes", {
        idActivo: currentForm.idActivo,
        nuevosComponentes: currentForm.nuevosComponentes,
        idMantenimiento: idMantenimiento,
        observaciones: observaciones,
      });

      // Avanzar al siguiente formulario
      if (currentIndex < updatedFormularios.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Finalizar si es el último
        onSubmit(updatedFormularios);
        onClose();
      }
    } catch (error) {
      console.error("Error al guardar componentes:", error);
      alert("Hubo un error al guardar los componentes.");
    }
  };

  const currentForm = updatedFormularios[currentIndex];

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={false}
      contentLabel="Actualizar Componentes"
      style={{
        overlay: { zIndex: 2000, backgroundColor: "rgba(0, 0, 0, 0.5)" },
        content: {
          zIndex: 2001,
          position: "relative",
          margin: "auto",
          maxWidth: "600px",
          borderRadius: "10px",
          padding: "20px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <h3>Actualizar Componentes</h3>
      <h5>Activo ID: {currentForm.idActivo}</h5>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {/* Componentes Actuales */}
        <div>
          <h6>Componentes Actuales</h6>
          {currentForm.componentesActuales.length > 0 ? (
            <ul>
              {currentForm.componentesActuales.map((componente) => (
                <li key={componente.id_componente}>
                  {componente.nombre_componente}
                </li>
              ))}
            </ul>
          ) : (
            <p>No se encontraron componentes actuales.</p>
          )}
          <TextField
            id="outlined-basic"
            label="Observaciones"
            variant="outlined"
            value={observaciones} // Vinculamos el valor del estado con el TextField
            onChange={handleObservacionesChange} // Actualizamos el estado cuando el usuario escribe
          />{" "}
        </div>

        {/* Formulario de Nuevos Componentes */}
        <div>
          <h6>Nuevos Componentes</h6>
          <Componentes
            handleChangeComponent={(e, tipo) => handleComponentChange(e, tipo)}
            getInputClass={(tipo) =>
              currentForm.nuevosComponentes[tipo] ? "valid" : "invalid"
            }
            nuevosComponentes={currentForm.nuevosComponentes}
          />
        </div>
      </div>

      {/* Navegación */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        {currentIndex < updatedFormularios.length - 1 ? (
          <button
            onClick={handleSave}
            style={{ backgroundColor: "green", color: "white" }}
          >
            Guardar
          </button>
        ) : (
          <button
            onClick={handleSave}
            style={{ backgroundColor: "green", color: "white" }}
          >
            Guardar y Finalizar
          </button>
        )}
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
    </Modal>
  );
}

export default ActualizarComponentesModal;
