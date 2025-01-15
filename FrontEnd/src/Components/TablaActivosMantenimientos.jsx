import axios from "axios";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import Checkbox from "./checkbox"; // Ajusta la ruta según la ubicación de tu archivo
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";

const TablaSeleccionActivos = ({
  activos,
  columnas,
  filtrosConfig,
  idMantenimiento,
  onSelectedActivosChange
}) => {
  const [filtrosSeleccionados, setFiltrosSeleccionados] = useState({});
  const [activosFiltrados, setActivosFiltrados] = useState(activos);
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 5; // Número de elementos por página
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filtrosData, setFiltrosData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ titulo: "", mensaje: "" });
  const [showModalError, setShowModalError] = useState(false);
  const [modalDataError, setModalDataError] = useState({
    titulo: "",
    mensaje: "",
  });
  const [selectedActivos, setSelectedActivos] = useState([]);
  const selectAllActivos = (activos) => {
    setSelectedActivos(activos); // Asignamos todos los activos filtrados seleccionados
  };
  // Calcular activos a mostrar según la página actual
  const indiceInicial = (paginaActual - 1) * elementosPorPagina;
  const indiceFinal = indiceInicial + elementosPorPagina;
  const activosPaginados = activosFiltrados.slice(indiceInicial, indiceFinal);
  // Total de páginas basado en activos filtrados
  const totalPaginas = Math.ceil(activosFiltrados.length / elementosPorPagina);

  const handlePaginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };
  const handleSelectActivo = (activo) => {
    setSelectedActivos((prevSelected) => {
      const isSelected = prevSelected.some(
        (item) => item.id_activo === activo.id_activo
      );

      const updatedSelected = isSelected
        ? prevSelected.filter((item) => item.id_activo !== activo.id_activo)
        : [...prevSelected, activo];

      // Notificar al componente padre
      if (onSelectedActivosChange) {
        onSelectedActivosChange(updatedSelected);
      }

      return updatedSelected;
    });
  };

  const handlePaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  // Manejar el cambio en los filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltrosSeleccionados((prev) => ({
      ...prev,
      [campo]: valor,
    }));
    console.log(filtrosSeleccionados);
  };

  // Consultar datos para los filtros desde la base de datos
  useEffect(() => {
    const obtenerFiltros = async () => {
      try {
        const datos = {};
        for (const filtro of filtrosConfig) {
          if (filtro.options) {
            // Si se proporcionan opciones estáticas, úsalas directamente
            datos[filtro.field] = filtro.options;
          } else if (filtro.apiEndpoint) {
            // Si se proporciona un endpoint, realiza la consulta
            const response = await axios.get(filtro.apiEndpoint);
            datos[filtro.field] = response.data;
          }
        }
        setFiltrosData(datos);
      } catch (error) {
        console.error("Error al cargar filtros dinámicos:", error);
      }
    };
    obtenerFiltros();
  }, [filtrosConfig]);

  // Filtrar datos en base a los filtros seleccionados
  useEffect(() => {
    let datosFiltrados = [...activos]; // Aseguramos que estamos copiando el array y no modificando directamente

    // Aplica cada filtro dinámico seleccionado (excluye fechas)
    for (const campo in filtrosSeleccionados) {
      if (
        filtrosSeleccionados[campo] &&
        campo !== "fechaInicio" &&
        campo !== "fechaFin"
      ) {
        datosFiltrados = datosFiltrados.filter(
          (activo) => activo[campo] === filtrosSeleccionados[campo]
        );
      }
    }

    // Aplica el filtro de búsqueda
    if (terminoBusqueda) {
      datosFiltrados = datosFiltrados.filter((activo) =>
        activo.numero_serie
          .toLowerCase()
          .includes(terminoBusqueda.toLowerCase())
      );
    }

    // Aplica los filtros de rango de fechas basado en fecha_registro
    if (filtrosSeleccionados.fechaInicio) {
      datosFiltrados = datosFiltrados.filter((activo) => {
        if (!activo.fecha_registro) {
          return false;
        }

        const fechaRegistro = new Date(activo.fecha_registro)
          .toISOString()
          .split("T")[0];

        return fechaRegistro >= filtrosSeleccionados.fechaInicio;
      });
    }

    if (filtrosSeleccionados.fechaFin) {
      datosFiltrados = datosFiltrados.filter((activo) => {
        if (!activo.fecha_registro) {
          return false;
        }

        const fechaRegistro = new Date(activo.fecha_registro)
          .toISOString()
          .split("T")[0];
        return fechaRegistro <= filtrosSeleccionados.fechaFin;
      });
    }

    // Actualizamos los datos filtrados
    setActivosFiltrados(datosFiltrados);
    console.log(datosFiltrados);

    setPaginaActual(1); // Reiniciar a la primera página al aplicar filtros
  }, [filtrosSeleccionados, terminoBusqueda, activos]);

  const handleLimpiarFiltros = () => {
    setFiltrosSeleccionados({});
    setTerminoBusqueda(""); // Limpia el término de búsqueda
    setActivosFiltrados(activos); // Restablece los datos filtrados a los originales
    setPaginaActual(1); // Reinicia a la primera página
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;

    if (checked) {
      // Si el checkbox está marcado, selecciona todos los activos filtrados o todos los activos
      setSelectedActivos(
        activosFiltrados.length > 0 ? activosFiltrados : activos
      );
    } else {
      // Si el checkbox está desmarcado, deselecciona todos los activos
      setSelectedActivos([]);
    }
  };

  const resetModalStates = () => {
    setShowModal(false);
    setShowModalError(false);
    setModalData({ titulo: "", mensaje: "" });
    setModalDataError({ titulo: "", mensaje: "" });
  };
  if (idMantenimiento !== null || idMantenimiento !== undefined) {
    const handleSubmit = async () => {
      if (selectedActivos.length === 0) {
        setModalDataError({
          titulo: "Error de Validación",
          mensaje: "Por favor selecciona al menos un activo.",
        });
        setShowModalError(true);
        setTimeout(() => {
          setShowModalError(false);
        }, 3000);
        return;
      }

      try {
        resetModalStates();

        const response = await axios.post(
          "http://localhost:5000/guardar_activos",
          {
            idMantenimiento, // Incluye el ID del mantenimiento
            activos: selectedActivos.map((activo) => activo.id_activo), // Extraer solo los IDs
          }
        );

        if (response.data.message === "Activos guardados con éxito") {
          setModalData({
            titulo: "Activos Agregados",
            mensaje: "Los activos se agregaron con éxito.",
          });
          setShowModal(true);

          setTimeout(() => {
            setShowModal(false);

            window.location.reload();
          }, 3000);
        } else {
          setModalDataError({
            titulo: "Error al agregar activos",
            mensaje: "No se pudo agregar los activos.",
          });
          setShowModalError(true);
          setTimeout(() => {
            setShowModalError(false);
          }, 3000);
        }
      } catch (err) {
        setModalDataError({
          titulo: "Error al agregar activos",
          mensaje: err.response?.data?.error || "Ocurrió un error inesperado.",
        });
        console.log(err);
        setShowModalError(true);
        setTimeout(() => {
          setShowModal(false);
        }, 3000);
      }
    };
    return (
      <div>
        {/* Input de búsqueda y filtros de fecha */}
        <div className="d-flex align-items-center mb-4 gap-3">
          {idMantenimiento && (
            <div>
              <button className="btn btn-danger" onClick={handleSubmit}>
                Agregar Activos
              </button>
            </div>
          )}
          {/* Input de búsqueda */}
          <div style={{ position: "relative", width: "250px" }}>
            <input
              type="text"
              placeholder="Buscar Por Código"
              style={{
                border: "5px solid #a32126",
                borderRadius: "20px",
                padding: "5px 25px",
                width: "100%",
              }}
              value={terminoBusqueda}
              onChange={(e) => {
                setTerminoBusqueda(e.target.value);
                setPaginaActual(1); // Reiniciar a la primera página al buscar
              }}
              maxLength={20}
            />
            <button
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <img
                src="/lupa-de-busqueda.png"
                alt="Buscar"
                style={{ width: "20px", height: "20px" }}
              />
            </button>
          </div>

          {/* Filtros de fecha */}
          <div>
            <label
              htmlFor="fechaInicio"
              style={{
                marginRight: "15px",
              }}
            >
              Fecha Inicio:
            </label>
            <input
              type="date"
              id="fechaInicio"
              value={filtrosSeleccionados.fechaInicio || ""}
              onChange={(e) => {
                setFiltrosSeleccionados((prevFilters) => ({
                  ...prevFilters,
                  fechaInicio: e.target.value,
                }));
                setPaginaActual(1); // Reiniciar a la primera página
              }}
              style={{
                borderRadius: "10px",
                padding: "5px",
                width: "150px",
              }}
            />
          </div>
          <div>
            <label
              htmlFor="fechaFin"
              style={{
                marginRight: "15px",
              }}
            >
              Fecha Fin:
            </label>
            <input
              type="date"
              id="fechaFin"
              value={filtrosSeleccionados.fechaFin || ""}
              onChange={(e) => {
                setFiltrosSeleccionados((prevFilters) => ({
                  ...prevFilters,
                  fechaFin: e.target.value,
                }));
                setPaginaActual(1); // Reiniciar a la primera página
              }}
              style={{
                borderRadius: "10px",
                padding: "5px",
                width: "150px",
              }}
            />
          </div>
        </div>
        {/* Filtros dinámicos */}
        <div className="row mb-4">
          {filtrosConfig.map((filtro, index) => (
            <div className="col-md-3" key={index}>
              <select
                className="form-control"
                value={filtrosSeleccionados[filtro.field] || ""}
                onChange={(e) =>
                  handleFiltroChange(filtro.field, e.target.value)
                }
              >
                <option value="">Seleccione {filtro.field}</option>
                {(filtrosData[filtro.field] || []).map((opcion, idx) => (
                  <option key={idx} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        {/* Checkbox de selección y tabla */}
        <div className="d-flex align-items-center mb-4 gap-3">
          {/* Checkbox de selección */}
          <Checkbox
            checked={
              activosFiltrados.length > 0
                ? selectedActivos.length === activosFiltrados.length
                : selectedActivos.length === activos.length
            }
            onChange={(e) => {
              const checked = e.target.checked;
              const updatedSelected = checked
                ? activosFiltrados.length > 0
                  ? activosFiltrados
                  : activos
                : [];

              // Actualiza el estado y notifica al componente padre
              setSelectedActivos(updatedSelected);
              onSelectedActivosChange(updatedSelected);
              if (onSelectedActivosChange) {
                onSelectedActivosChange(updatedSelected);
              }
            }}
          />
          <p>Cantidad de activos seleccionados: {selectedActivos.length}</p>
          Seleccionar Todos
          {/* Botón Limpiar Filtros */}
          <button
            type="button"
            onClick={handleLimpiarFiltros}
            className="btn btn-danger ms-auto"
          >
            Limpiar Filtros
          </button>
        </div>
        <div
          style={{
            maxHeight: "800px",
            overflowY: "auto",
            border: "1px solid #ddd",
            borderRadius: "5px",
            padding: "10px",
            marginTop: "10px",
          }}
        >
          <table
            className="table-bordered"
            style={{ border: "2px solid black", width: "100%" }}
          >
            <thead
              style={{
                backgroundColor: "#921c21",
                color: "white",
                textAlign: "center",
              }}
            >
              <tr>
                <th scope="col">Seleccionar</th>
                {columnas.map((columna, index) => (
                  <th key={index} scope="col" style={{ height: "50px" }}>
                    {columna.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ textAlign: "center" }}>
              {activosPaginados.length > 0 ? (
                activosPaginados.map((activo) => (
                  <tr key={activo.id_activo} style={{ height: "60px" }}>
                    <td className="text-center">
                      <input
                        style={{
                          transform: "scale(1.5)",
                          margin: "5px",
                          cursor: "pointer",
                        }}
                        type="checkbox"
                        checked={selectedActivos.some(
                          (activoSeleccionado) =>
                            activoSeleccionado.id_activo === activo.id_activo
                        )}
                        onChange={() => handleSelectActivo(activo)}
                      />
                    </td>
                    {columnas.map((columna, index) => (
                      <td key={index}>{columna.render(activo)}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columnas.length + 1}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No hay datos disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Controles de paginación */}
        <div
          className="d-flex justify-content-between align-items-center mt-4"
          style={{ gap: "20px" }}
        >
          <button
            className="btn"
            style={{ backgroundColor: "rgb(163, 33, 38)", color: "white" }}
            onClick={handlePaginaAnterior}
            disabled={paginaActual === 1}
          >
            Anterior
          </button>
          <span>
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            className="btn"
            style={{ backgroundColor: "rgb(163, 33, 38)", color: "white" }}
            onClick={handlePaginaSiguiente}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente
          </button>
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
    );
  }

  TablaSeleccionActivos.propTypes = {
    activos: PropTypes.arrayOf(
      PropTypes.shape({
        id_activo: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        numero_serie: PropTypes.string.isRequired,
        tipo_activo: PropTypes.string.isRequired,
        tipo: PropTypes.string.isRequired,
        estado: PropTypes.string.isRequired,
        ubicacion: PropTypes.string.isRequired,
        fecha_registro: PropTypes.string.isRequired,
      })
    ).isRequired,
    selectedActivos: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    handleSelectActivo: PropTypes.func.isRequired,
    selectAllActivos: PropTypes.func.isRequired,
    columnas: PropTypes.arrayOf(
      PropTypes.shape({
        header: PropTypes.string.isRequired,
        render: PropTypes.func.isRequired,
      })
    ).isRequired,
    filtrosConfig: PropTypes.arrayOf(
      PropTypes.shape({
        field: PropTypes.string.isRequired,
        apiEndpoint: PropTypes.string,
        options: PropTypes.arrayOf(PropTypes.string),
      })
    ).isRequired,
    idMantenimiento: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };
};
export default TablaSeleccionActivos;
