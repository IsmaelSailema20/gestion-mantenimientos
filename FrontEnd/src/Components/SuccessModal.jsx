import { useState, useEffect } from "react";

import PropTypes from "prop-types"; // Importa PropTypes
// Agregar validación de las propiedades usando PropTypes

SuccessModal.propTypes = {
  titulo: PropTypes.string.isRequired, // La propiedad titulo debe ser un string y es requerida
  mensaje: PropTypes.string.isRequired, // La propiedad mensaje debe ser un string y es requerida
};
function SuccessModal({ titulo, mensaje }) {
  const [showModal, setShowModal] = useState(false); // Controlar la visibilidad del modal

  // Mostrar el modal automáticamente al montar el componente
  useEffect(() => {
    setShowModal(true); // Muestra el modal cuando se monta el componente

    // Cerrar el modal automáticamente después de 3 segundos
    const timer = setTimeout(() => {
      setShowModal(false); // Cierra el modal después de 3 segundos
    }, 3000);

    // Limpiar el timer cuando el componente se desmonte
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div
        className={`modal fade ${showModal ? "show" : ""}`} // Aparece solo si showModal es true
        id="statusSuccessModal"
        tabIndex="-1"
        role="dialog"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        style={{ display: showModal ? "block" : "none" }} // Mostrar solo si showModal es true
      >
        <div
          className="modal-dialog modal-dialog-centered modal-sm"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-body text-center p-lg-4">
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 130.2 130.2"
              >
                <circle
                  className="path circle"
                  fill="none"
                  stroke="#198754"
                  strokeWidth="6"
                  strokeMiterlimit="10"
                  cx="65.1"
                  cy="65.1"
                  r="62.1"
                />
                <polyline
                  className="path check"
                  fill="none"
                  stroke="#198754"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeMiterlimit="10"
                  points="100.2,40.2 51.5,88.8 29.8,67.5 "
                />
              </svg>
              <h4 className="text-success mt-3">{titulo}</h4>
              <p className="mt-3">{mensaje}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SuccessModal;
