import axios from "axios";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const TablaSeleccionActivos1 = ({
  activos,
  columnas,
  filtrosConfig,
  mostrarFiltros = true,
}) => {
  const [filtrosSeleccionados, setFiltrosSeleccionados] = useState({});
  const [activosFiltrados, setActivosFiltrados] = useState(activos || []);
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 7; // Número de elementos por página
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filtrosData, setFiltrosData] = useState({});

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
  };

  // Consultar datos para los filtros desde la base de datos
  useEffect(() => {
    const obtenerFiltros = async () => {
      try {
        const datos = {};
        for (const filtro of filtrosConfig) {
          if (filtro.options) {
            datos[filtro.field] = filtro.options;
          } else if (filtro.apiEndpoint) {
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
    let datosFiltrados = [...activos];

    // Aplica cada filtro dinámico seleccionado
    for (const campo in filtrosSeleccionados) {
      if (filtrosSeleccionados[campo]) {
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

    setActivosFiltrados(datosFiltrados);
    setPaginaActual(1); // Reiniciar a la primera página al aplicar filtros
  }, [filtrosSeleccionados, terminoBusqueda, activos]);

  const handleLimpiarFiltros = () => {
    setFiltrosSeleccionados({});
    setTerminoBusqueda("");
    setActivosFiltrados(activos);
    setPaginaActual(1);
  };

  return (
    <div>
      {/* Input de búsqueda */}
      <div className="d-flex align-items-center mb-4 gap-3">
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

        {/* Botón Limpiar Filtros */}
        <button
          type="button"
          onClick={handleLimpiarFiltros}
          className="btn btn-danger ms-auto"
        >
          Limpiar Filtros
        </button>
      </div>

      {/* Filtros dinámicos */}
      <div className="row mb-4">
        {filtrosConfig.map((filtro, index) => (
          <div className="col-md-3" key={index}>
            <select
              className="form-control"
              value={filtrosSeleccionados[filtro.field] || ""}
              onChange={(e) => handleFiltroChange(filtro.field, e.target.value)}
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

      {/* Tabla */}
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
              {columnas.map((columna, index) => (
                <th key={index} scope="col" style={{ height: "50px" }}>
                  {columna.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ textAlign: "center" }}>
            {Array.isArray(activosPaginados) && activosPaginados.length > 0 ? (
              activosPaginados.map((activo) => (
                <tr key={activo.id_activo}>
                  {columnas.map((columna, index) => (
                    <td key={index}>{columna.render(activo)}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columnas.length}
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
    </div>
  );
};

export default TablaSeleccionActivos1;
