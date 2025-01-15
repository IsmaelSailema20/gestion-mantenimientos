import React, { useState, useEffect } from "react";
import axios from "axios";
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";
import ActualizarComponentesModal from "./ActualizarComponentesModal";
import ComboBox from "./selectSearch";
import ComboBoxAc from "./comboboxActividades";

function AgregarActividad({
  activosSeleccionados,
  closeModal,
  idMantenimiento,
}) {
  const [actividades, setActividades] = useState([]);
  const [actividadSeleccionada, setActividadSeleccionada] = useState("");
  const [actividadSeleccionadaNombre, setActividadSeleccionadaNombre] =
    useState("");
  const [conteoCategorias, setConteoCategorias] = useState({});
  const [disabled, setDisabled] = useState(true);
  const [actividadesSeleccionadas, setActividadesSeleccionadas] = useState([]);
  const [componentes, setComponentes] = useState([]);
  const [componentesSeleccionados, setComponentesSeleccionados] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(""); // Almacena la categoría seleccionada
  const [datosComponentes, setDatosComponentes] = useState({}); // Almacena el JSON completo de la API
  const [categorias, setCategorias] = useState([]);
  const [showComp, setshowComp] = useState("");
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
        const actividadesDisponibles = response.data;

        const responseAnteriores = await axios.post(
          "http://localhost:5000/actividadesRealizadas",
          {
            id: activosSeleccionados.detalle_mantenimiento,
          }
        );
        const actividadesPrevias = responseAnteriores.data;
        const tieneCambioDeComponentes = actividadesPrevias.some(
          (actividad) => actividad.nombre === "Cambio de componentes"
        );
        if (tieneCambioDeComponentes) {
          setDisabled(false);
          await cargarComponentes();
        }
        console.log("Actividades previas:", actividadesPrevias);
        console.log(actividadesDisponibles);

        setActividadesSeleccionadas(actividadesPrevias);

        const actividadesFiltradas = actividadesDisponibles.filter(
          (actividad) =>
            !actividadesPrevias.some((previa) => previa.id === actividad.id)
        );
        console.log(actividadesFiltradas);

        setActividades(actividadesFiltradas);

        console.log("Actividades disponibles:", actividadesFiltradas);
        console.log("Actividades realizadas:", actividadesPrevias);
      } catch (err) {
        console.error("Error al cargar actividades:", err);
        setError("Error al cargar actividades");
      }
    };
    const cargarComponentes = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/componentesSeleccionados",
          {
            id: activosSeleccionados.detalle_mantenimiento,
          }
        );
        const componentesGuardados = response.data;
        setComponentesSeleccionados(componentesGuardados);

        const cmptotal = await axios.get("http://localhost:5000/componentes");
        setDatosComponentes(cmptotal.data);
        console.log(datosComponentes);
        const categoriasDisponibles = Object.keys(cmptotal.data);
        setCategorias(categoriasDisponibles);
      } catch (err) {
        console.error("Error al cargar componentes:", err);
        setError("Error al cargar componentes");
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
    if (
      disabled == false &&
      (!componentesSeleccionados || componentesSeleccionados.length === 0)
    ) {
      setModalDataError({
        titulo: "Error de Validación",
        mensaje: "Debe seleccionar al menos un componente.",
      });
      setShowModalError(true);
      setTimeout(() => {
        setShowModalError(false);
      }, 3000);
      return;
    }
    if (disabled == false) {
      try {
        const resCom = await axios.post(
          "http://localhost:5000/guardarcomponentes",
          {
            idActivo: activosSeleccionados.id_activo,
            nuevosComponentes: componentesSeleccionados,
            idMantenimiento: idMantenimiento,
          }
        );
        if (resCom.data.message === "Componentes actualizados exitosamente.") {
        } else {
          if (
            resCom.data.message ===
            "Todos los componentes ya están registrados en el historial."
          ) {
          }
        }
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
        response.data.message === "Las actividades se actualizaron con éxito."
      ) {
        setModalData({
          titulo: "Cambios guardados",
          mensaje: "Sus selecciones se guardaron correctamente",
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
        setDisabled(true);
        setComponentesSeleccionados([]);
      }
      console.log("Actividad eliminada del recuadro:", actividad);
      console.log("Actividades disponibles actualizadas:", actividades);
    }
  };

  const handleSeleccionarActividad = async (e, newValue) => {
    const actividadId = newValue.toString() || e?.target?.value || "";
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
      setDisabled(false);

      try {
        const response = await axios.get("http://localhost:5000/componentes");
        console.log("Respuesta de la API:", response.data);
        console.log(response);
        setDatosComponentes(response.data);
        const categoriasDisponibles = Object.keys(response.data);
        setCategorias(categoriasDisponibles);

        const procesadores = response.data.procesadores || [];
        setComponentes(procesadores);
      } catch (error) {
        console.error("Error al cargar componentes:", error);
      }
    }
  };

  const handleSeleccionarComponente = (e, newValue) => {
    const componenteId = newValue.toString() || e?.target?.value || "";
    const componente = componentes.find(
      (comp) => comp.id === Number(componenteId)
    );
    console.log(componente);
    if (componente) {
      const categoriaSeleccionadaa = categoriaSeleccionada; // Ya tienes esta categoría en tu estado
      const conteoActual = conteoCategorias[categoriaSeleccionadaa] || 0;

      if (conteoActual >= 1) {
        setModalDataError({
          titulo: "Componente Duplicado",
          mensaje: `Ya has seleccionado un componente de la categoría "${categoriaSeleccionadaa}".`,
        });
        setShowModalError(true);
        setTimeout(() => {
          setShowModalError(false);
        }, 3000);
        console.log(conteoActual);
        return;
      }
      setConteoCategorias((prev) => ({
        ...prev,
        [categoriaSeleccionadaa]: 1,
      }));
      setComponentesSeleccionados((prev) => [...prev, componente]);
      setComponentes((prev) =>
        prev.filter((comp) => comp.id !== Number(componenteId))
      );
      console.log("Componente seleccionado:", componente);
      console.log("Componentes restantes:", componentes);
      console.log(conteoActual);
    }
  };

  const handleEliminarComponente = (componenteId) => {
    const componente = componentesSeleccionados.find(
      (comp) => comp.id === componenteId
    );
    console.log("Componente seleccionadoeliminar:", componente);

    if (componente) {
      const categoria = componente.categoria;

      const componentesCategoria = datosComponentes[categoria] || [];
      console.log(datosComponentes);
      setComponentes(componentesCategoria);

      console.log(categoriaSeleccionada);
      setConteoCategorias((prev) => ({
        ...prev,
        [categoria]: 0,
      }));
      const conteoActual = conteoCategorias[categoria] || 0;

      console.log(conteoActual);
      setComponentesSeleccionados((prev) =>
        prev.filter((comp) => comp.id !== componenteId)
      );
      setComponentes((prev) => prev.filter((comp) => comp.id !== componenteId));

      setComponentes((prev) => [...prev, componente]);
    if(categoriaSeleccionada){
      setComponentes(datosComponentes[categoriaSeleccionada]);

    }else{
      setComponentes([]);
    }
    }
  };
  const actualizarDatosComponentes = () => {
    let datosActualizados = { ...datosComponentes };
    componentesSeleccionados.forEach((componente) => {
      const { id, categoria } = componente;
      console.log("Componente actual:", componente);
      const conteoActual = conteoCategorias[categoria] || 0;
      setConteoCategorias((prev) => ({
        ...prev,
        [categoria]: conteoActual + 1,
      }));
      if (datosActualizados[categoria]) {
        console.log(datosActualizados[categoria]);
        datosActualizados[categoria] = datosActualizados[categoria].filter(
          (item) => item.id !== id
        );
        console.log(datosActualizados[categoria]);
      }
    });
    console.log("Datos actualizados:", datosActualizados);

    setDatosComponentes(datosActualizados);
  };
  const handleCategoriaChange = (e, newValue) => {
    const categoria = newValue || e?.target?.value || ""; // Obtiene el valor según el origen del evento
 
    if(categoria==='tarjetasmadre'){
      setCategoriaSeleccionada('tarjetasMadre'); // Actualiza la categoría seleccionada

    }else{
      setCategoriaSeleccionada(categoria); // Actualiza la categoría seleccionada

    }
    console.log(categoria);
    console.log(datosComponentes);
    const elegidos = componentesSeleccionados;
    console.log(elegidos);
    actualizarDatosComponentes();

    console.log(datosComponentes);
    // Filtra los componentes de la categoría seleccionada
    const componentesCategoria = datosComponentes[categoria] || [];
    console.log(datosComponentes);
    setComponentes(componentesCategoria);
    // Actualiza los componentes a mostrar
  };

  useEffect(() => {
    if (categoriaSeleccionada) {
      const componentesCategoria =
        datosComponentes[categoriaSeleccionada] || [];
      setComponentes(componentesCategoria);
    }
    console.log(actividades);
  }, [datosComponentes, categoriaSeleccionada]);
  useEffect(() => {
    // Este código se ejecutará después de que la página se haya cargado
  }, []); // El array vacío asegura que el efecto se ejecute solo una vez
  const handleComponenteSelect = (e) => {
    const { value } = e.target;
    const categoria = categoriaSeleccionada;

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
  const actividadesFiltradas = actividades.filter(
    (actividad) =>
      !actividadesSeleccionadas.some((sel) => sel.id === actividad.id)
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h4
        style={{
          fontWeight: "bold",
          textAlign: "center",
          marginTop: "-12px",
          backgroundColor: "#a32126",
          padding: "15px 20px",
          borderRadius: "5px 5px 0 0",
          color: "white",
          width: "102%",
          boxSizing: "border-box",
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
          color: "white", // Color blanco para que contraste
          position: "absolute",
          top: "1px",
          right: "10px",
        }}
        onClick={closeModal}
      >
        &times;
      </span>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "80%",
          margintop: "10px",
          marginBottom: "20px",
          borderBottom: "1px solid #ddd",
          paddingBottom: "1px",
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
          display: "flex",
          justifyContent: "space-between",
          width: "80%",
          alignItems: "flex-start",
          gap: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            flex: 1,
          }}
        >
          <div>
            <label style={{ fontWeight: "bold", display: "block" }}>
              Actividades
            </label>
            {/** <select
              id="actividad"
              onChange={handleSeleccionarActividad}
              value={actividadSeleccionada}
              style={{
                width: "100%",
                padding: "8px",
                fontSize: "1rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <option value="">Seleccione una actividad</option>
              {actividades
                .filter(
                  (actividad) =>
                    !actividadesSeleccionadas.some(
                      (sel) => sel.id === actividad.id
                    )
                )
                .map((actividad) => (
                  <option key={actividad.id} value={actividad.id}>
                    {actividad.nombre}
                  </option>
                ))}
            </select> */}
            <ComboBoxAc
              datos={actividadesFiltradas}
              datosSeleccionado={actividadSeleccionada}
              handleDatoChange={handleSeleccionarActividad}
              propiedad={"nombre"}
              label={""}
            />
          </div>
          <div>
            <label style={{ fontWeight: "bold", display: "block" }}>
              Categorias
            </label>
            {/** <select
              id="categoria"
              onChange={handleCategoriaChange}
              value={categoriaSeleccionada}
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria.charAt(0).toUpperCase() + categoria.slice(1)}{" "}
                </option>
              ))}
            </select>
             */}
            <ComboBox
              datos={categorias}
              datosSeleccionado={categoriaSeleccionada}
              handleDatoChange={handleCategoriaChange}
              disabled={disabled}
            />
          </div>
          <div>
            <label style={{ fontWeight: "bold", display: "block" }}>
              Componentes
            </label>
            {/**   <select
              style={{
                width: "100%",
                padding: "8px",
                fontSize: "1rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
              id="componentes"
              onChange={handleSeleccionarComponente}
            >
              <option value="">Seleccione un componente</option>
              {(componentes || []).map((componente) => (
                <option key={componente.id} value={componente.id}>
                  {componente.label}
                </option>
              ))}
            </select>
            */}
            <ComboBoxAc
              datos={componentes}
              handleDatoChange={handleSeleccionarComponente}
              propiedad={"label"}
              label={""}
              disabled={disabled}
            />
          </div>
          <button
            onClick={handleAgregarActividad}
            style={{
              backgroundColor: "#921c21",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Guardar Cambios
          </button>
        </div>

        <div
          style={{
            flex: 1,
            border: "1px solid #921c21",
            borderRadius: "4px",
            padding: "10px",
            backgroundColor: "#f9f9f9",
            overflowY: "auto",
            maxHeight: "300px",
          }}
        >
          <h5
            style={{
              textAlign: "center",
              backgroundColor: "#921c21",
              color: "white",
              padding: "10px",
              margin: "-10px -10px 10px -10px",
            }}
          >
            Lista De Actividades
          </h5>
          {actividadesSeleccionadas.length === 0 ? (
            <div style={{ padding: "1" }}>No hay actividades seleccionadas</div>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                margin: 0,
                padding: 0,
              }}
            >
              <tbody>
                {actividadesSeleccionadas.map((actividad) => (
                  <tr
                    key={actividad.id}
                    style={{ borderBottom: "1px solid #eee" }}
                  >
                    <td style={{ padding: "10px" }}>{actividad.nombre}</td>
                    <td style={{ textAlign: "right", padding: "10px" }}>
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
        <div
          style={{
            flex: 1,
            border: "1px solid #921c21",
            borderRadius: "4px",
            padding: "10px",
            backgroundColor: "#f9f9f9",
            overflowY: "auto",
            maxHeight: "300px",
          }}
        >
          <h5
            style={{
              textAlign: "center",
              backgroundColor: "#921c21",
              color: "white",
              padding: "10px",
              margin: "-10px -10px 10px -10px",
            }}
          >
            Lista De Componentes
          </h5>
          {componentesSeleccionados.length === 0 ? (
            <div
              style={{
                padding: "10px",
                backgroundClip: disabled ? "gray" : "block",
              }}
            >
              No hay componentes seleccionados
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                display: disabled ? "none" : "table",
              }}
            >
              <tbody>
                {componentesSeleccionados.map((componente) => (
                  <tr
                    key={componente.id}
                    style={{ borderBottom: "1px solid #eee" }}
                  >
                    <td style={{ padding: "10px" }}>{componente.label}</td>
                    <td style={{ textAlign: "right", padding: "10px" }}>
                      <span
                        onClick={() => handleEliminarComponente(componente.id)}
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
    </div>
  );
}

export default AgregarActividad;
