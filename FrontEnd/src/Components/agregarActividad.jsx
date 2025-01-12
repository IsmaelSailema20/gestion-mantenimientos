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
  const [actividadesSeleccionadas, setActividadesSeleccionadas] = useState([]);
  const [componentes, setComponentes] = useState([]);
  const [componentesSeleccionados, setComponentesSeleccionados] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(""); // Almacena la categoría seleccionada
  const [datosComponentes, setDatosComponentes] = useState({}); // Almacena el JSON completo de la API
  const [categorias, setCategorias] = useState([]);
  const [showComp, setshowComp] =  useState("");
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

    console.log(componentesSeleccionados);

    setError("");

    if (!actividadesSeleccionadas || actividadesSeleccionadas.length === 0) {
      setModalDataError({
        titulo: "Error de Validación",
        mensaje: "Debe seleccionar al menos una actividad.",
      });
      setShowModalError(true);
      setTimeout(() => {
        setShowModalError(false);
      }, 3000);
      return;
    }

    if (showComp === "Cambio de componentes") {
      try {
        await axios.post("http://localhost:5000/guardarcomponentes", {
          idActivo: activosSeleccionados.id_activo,
          nuevosComponentes: componentesSeleccionados,
          idMantenimiento: idMantenimiento,
        });
      
      } catch (error) {
        console.error("Error al guardar componentes:", error);
        alert("Hubo un error al guardar los componentes.");
      }
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/insertarActividad",
        {
          idActivos: activosSeleccionados.id_activo,
          idActividad: actividadesSeleccionadas,
          idMantenimiento: idMantenimiento,
        }
      );
      console.log(response.data.message);
      if (
        response.data.message ===
        "Las actividades se agregaron con éxito al activo."
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
    const actividad = actividadesSeleccionadas.find(
      (act) => act.id === actividadId
    );
  

    if (actividad) {
      setActividadesSeleccionadas((prev) =>
        prev.filter((act) => act.id !== actividadId)
      );
      setActividades((prev) => [...prev, actividad]);
      if (actividad?.nombre === "Cambio de componentes") {
        setshowComp("");
        setComponentesSeleccionados([]);
      }
      console.log("Actividad eliminada del recuadro:", actividad);
      console.log("Actividades disponibles actualizadas:", actividades);
    }
  };

  const handleSeleccionarActividad = async (e) => {
    const actividadId = e.target.value;
    const selectedActividad = actividades.find(
      (actividad) => actividad.id.toString() === actividadId
    );
    setActividadSeleccionada(actividadId);
    setActividadSeleccionadaNombre(selectedActividad?.nombre || "");

    if (!actividadId) {
      console.log("No se seleccionó ninguna actividad");
      return;
    }

    console.log("ID seleccionado:", actividadId);
    console.log("Actividad seleccionada:", selectedActividad);

    if (selectedActividad) {
      setActividadesSeleccionadas((prev) => [...prev, selectedActividad]);
      setActividades((prev) =>
        prev.filter((act) => act.id !== selectedActividad.id)
      );
    }

    if (selectedActividad?.nombre === "Cambio de componentes") {
      try {
        const response = await axios.get("http://localhost:5000/componentes");
        console.log("Respuesta de la API:", response.data);
        console.log(response);
        setshowComp("Cambio de componentes")
        setDatosComponentes(response.data); 
        const categoriasDisponibles = Object.keys(response.data);
        setCategorias(categoriasDisponibles); 

       
        const procesadores = response.data.procesadores || [];
        setComponentes(procesadores);
      } catch (error) {
        console.error("Error al cargar componentes:", error);
        setComponentes([]); // Manejo de errores
      }
    }
  };

  const handleSeleccionarComponente = (e) => {
    const componenteId = e.target.value;
    const componente = componentes.find(
      (comp) => comp.id === Number(componenteId)
    );

    if (componente) {
      setComponentesSeleccionados((prev) => [...prev, componente]);
      setComponentes((prev) =>
        prev.filter((comp) => comp.id !== Number(componenteId))
      );
      console.log("Componente seleccionado:", componente);
      console.log("Componentes restantes:", componentes);
    }
  };

  const handleEliminarComponente = (componenteId) => {
    const componente = componentesSeleccionados.find(
      (comp) => comp.id === componenteId
    );
    if (componente) {
      setComponentesSeleccionados((prev) =>
        prev.filter((comp) => comp.id !== componenteId)
      );
      setComponentes((prev) => [...prev, componente]);
    }
  };
  const handleCategoriaChange = (e) => {
    const categoria = e.target.value; // Obtiene la categoría seleccionada
    setCategoriaSeleccionada(categoria); // Actualiza la categoría seleccionada

    // Filtra los componentes de la categoría seleccionada
    const componentesCategoria = datosComponentes[categoria] || [];
    setComponentes(componentesCategoria); // Actualiza los componentes a mostrar
  };
  const handleComponenteSelect = (e) => {
    const { value } = e.target;
    const categoria = categoriaSeleccionada;

    // Verificar si ya se seleccionó un componente de esta categoría
    if (
      componentesSeleccionados[categoria] &&
      componentesSeleccionados[categoria] !== value
    ) {
      alert(`Solo puedes seleccionar un componente por categoría.`);
      return;
    }

    // Actualizar el estado de componentes seleccionados por categoría
    setComponentesSeleccionados((prevState) => ({
      ...prevState,
      [categoria]: value,
    }));
  };
  return (
    <div
      style={{
        justifyContent: "center",
        marginTop: "10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
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
        onClick={closeModal}
      >
        &times;
      </span>

      <div
        style={{
          marginTop: "20px",
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
          onChange={handleSeleccionarActividad}
          style={{ padding: "8px", fontSize: "1rem" }}
        >
          <option value="">Seleccione una actividad</option>
          {actividades.map((actividad) => (
            <option key={actividad.id} value={actividad.id}>
              {actividad.nombre}
            </option>
          ))}
        </select>

        <div
          style={{
            marginLeft: "20px",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            minWidth: "300px",
            maxHeight: "200px", // Altura máxima para habilitar el scroll
            overflowY: "auto", // Habilitar el scroll vertical
          }}
        >
          {actividadesSeleccionadas.length === 0 ? (
            <span>Actividades Seleccionadas</span>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      borderBottom: "1px solid #ccc",
                      textAlign: "left",
                      padding: "5px",
                    }}
                  >
                    Actividades
                  </th>
                </tr>
              </thead>
              <tbody>
                {actividadesSeleccionadas.map((actividad) => (
                  <tr key={actividad.id}>
                    <td
                      style={{ padding: "5px", borderBottom: "1px solid #eee" }}
                    >
                      {actividad.nombre}
                    </td>
                    <td
                      style={{ padding: "5px", borderBottom: "1px solid #eee" }}
                    >
                      <span
                        onClick={() => handleEliminarActividad(actividad.id)}
                        style={{
                          cursor: "pointer",
                          color: "red",
                          fontWeight: "bold",
                        }}
                      >
                        &times;
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {showComp === "Cambio de componentes" && (
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
            onChange={handleCategoriaChange}
            value={categoriaSeleccionada}
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria.charAt(0).toUpperCase() + categoria.slice(1)}{" "}
                {/* Capitaliza la primera letra */}
              </option>
            ))}
          </select>
          <select
            id="componentes"
            onChange={handleSeleccionarComponente}
            style={{ padding: "8px", fontSize: "1rem" }}
          >
            <option value="">Seleccione un componente</option>
            {componentes.map((componente) => (
              <option key={componente.id} value={componente.id}>
                {componente.label}
              </option>
            ))}
          </select>

          <div
            style={{
              marginLeft: "20px",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              minWidth: "300px",
              maxHeight: "200px", // Altura máxima para habilitar el scroll
              overflowY: "auto", // Habilitar el scroll vertical
            }}
          >
            {componentesSeleccionados.length === 0 ? (
              <span>Componentes Seleccionados</span>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        borderBottom: "1px solid #ccc",
                        textAlign: "left",
                        padding: "5px",
                      }}
                    >
                      Componentes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {componentesSeleccionados.map((componente) => (
                    <tr key={componente.id}>
                      <td
                        style={{
                          padding: "5px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {componente.label}
                      </td>
                      <td
                        style={{
                          padding: "5px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        <span
                          onClick={() =>
                            handleEliminarComponente(componente.id)
                          }
                          style={{
                            cursor: "pointer",
                            color: "red",
                            fontWeight: "bold",
                          }}
                        >
                          &times;
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
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
        Agregar Actividades
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
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

export default AgregarActividad;
