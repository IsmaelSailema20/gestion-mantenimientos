import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";

const MantenimientosPrincipal = ({ onEdit }) => {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    numero: "",
    estado: "",
    activos: "", // Aquí es un campo numérico
    tipo: "",
    inicio: "",
    fin: "",
    cantidad: 1,
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Número de elementos por página

  const fetchMantenimientos = async () => {
    try {
      const response = await axios.get("http://localhost:5000/mantenimientos", { params: filters });
      setMantenimientos(response.data);
      setIsLoading(false);
    } catch (error) {
      setError("Error al obtener los datos del servidor");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMantenimientos();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setCurrentPage(1); // Reiniciar a la primera página al cambiar los filtros
  };

  const toggleFilterDropdown = () => {
    setShowFilterDropdown(!showFilterDropdown);
  };

  // Filtrar mantenimientos
  const filteredMantenimientos = mantenimientos.filter((mantenimiento) => {
    return (
      (filters.numero === "" || mantenimiento.numero.toString().includes(filters.numero)) &&
      (filters.estado === "" || mantenimiento.estado.includes(filters.estado)) &&
      (filters.tipo === "" || mantenimiento.tipo.includes(filters.tipo)) &&
      (filters.inicio === "" || mantenimiento.inicio >= filters.inicio) &&
      (filters.fin === "" || mantenimiento.fin <= filters.fin) &&
      // Filtrar activos numéricamente
      (filters.activos === "" || mantenimiento.activos === parseInt(filters.activos, 10))
    );
  });

  // Calcular mantenimientos para la página actual
  const totalPages = Math.ceil(filteredMantenimientos.length / itemsPerPage);
  const currentMantenimientos = filteredMantenimientos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Manejar navegación de páginas
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="container">
      {/* Controles superiores */}
      <div className="mb-3">
        <button
          className="btn"
          style={{
            borderRadius: "20px",
            padding: "10px 20px",
            backgroundColor: "#a32126",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Crear Mantenimiento
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="d-flex flex-wrap gap-4 mb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center" style={{ position: "relative", width: "250px" }}>
            <input
              type="text"
              placeholder="Search"
              style={{
                border: "5px solid #a32126",
                borderRadius: "20px",
                padding: "5px 25px",
                width: "100%",
              }}
              name="numero"
              value={filters.numero}
              onChange={handleFilterChange}
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
          <div style={{ position: "relative" }}>
            <button
              onClick={toggleFilterDropdown}
              style={{
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <img
                src="/filtracion.png"
                alt="Filtrar"
                style={{ width: "40px", height: "40px" }}
              />
            </button>
            {showFilterDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "50px",
                  left: 0,
                  backgroundColor: "white",
                  border: "1px solid black",
                  borderRadius: "10px",
                  padding: "10px",
                  boxShadow: "1px 4px 6px rgba(0, 0, 0, 0.1)",
                  zIndex: 1000,
                }}
              >
                <div className="d-flex flex-column gap-2">
                  <select
                    name="estado"
                    value={filters.estado}
                    onChange={handleFilterChange}
                    className="form-control"
                    style={{
                      borderRadius: "10px",
                      padding: "10px",
                      border: "1px solid black",
                      width: "300px",
                    }}
                  >
                    <option value="">Seleccione Estado</option>
                    <option value="en proceso">En Proceso</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                  <select
                    name="tipo"
                    value={filters.tipo}
                    onChange={handleFilterChange}
                    className="form-control"
                    style={{
                      borderRadius: "10px",
                      padding: "10px",
                      border: "1px solid black",
                      width: "300px",
                    }}
                  >
                    <option value="">Seleccione Tipo</option>
                    <option value="correctivo">Correctivo</option>
                    <option value="preventivo">Preventivo</option>
                  </select>
                  <input
                    type="number"
                    name="activos"
                    placeholder="Número de Activos"
                    value={filters.activos}
                    onChange={handleFilterChange}
                    className="form-control"
                    style={{
                      borderRadius: "10px",
                      padding: "10px",
                      border: "1px solid black", 
                      width: "300px",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <button
      onClick={() => setFilters({
        numero: "",
        estado: "",
        activos: "",
        tipo: "",
        inicio: "",
        fin: "",
        cantidad: 1,
      })}
      style={{
        backgroundColor: "#a32126",
        border: "none",
        padding: "10px 20px",
        borderRadius: "25px",
        cursor: "pointer",
        fontWeight: "bold",
        color: "white"
      }}
    >
      Limpiar Filtros
    </button>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <label style={{ fontWeight: "bold" }}>Fecha - Inicio:</label>
              <input
                type="date"
                name="inicio"
                value={filters.inicio}
                onChange={handleFilterChange}
                className="form-control"
                style={{
                  borderRadius: "10px",
                  padding: "5px",
                  width: "180px",
                  border: "2px solid black",
                }}
              />
            </div>
            <div className="d-flex align-items-center gap-2">
              <label style={{ fontWeight: "bold" }}>Fecha - Fin:</label>
              <input
                type="date"
                name="fin"
                value={filters.fin}
                onChange={handleFilterChange}
                className="form-control"
                style={{
                  borderRadius: "10px",
                  padding: "5px",
                  width: "180px",
                  border: "2px solid black",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-responsive">
        {isLoading ? (
          <p>Cargando datos...</p>
        ) : error ? (
          <p>Error al cargar datos: {error}</p>
        ) : (
          <>
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
                }}
              >
                <tr>
                  <th>N° Mantenimiento</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Estado</th>
                  <th>N° Activos</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody style={{ textAlign: "center" }}>
                {currentMantenimientos.length > 0 ? (
                  currentMantenimientos.map((mantenimiento, index) => (
                    <tr key={index} style={{ height: "60px" }}>
                      <td>{mantenimiento.numero}</td>
                      <td>{mantenimiento.inicio}</td>
                      <td>{mantenimiento.fin}</td>
                      <td>{mantenimiento.estado}</td>
                      <td>{mantenimiento.activos}</td>
                      <td>{mantenimiento.tipo}</td>
                      <td>{mantenimiento.descripcion}</td>
                      <td className="text-center" style={{ padding: 0 }}>
                        <button
                          onClick={() => onEdit(mantenimiento)}
                          style={{
                            backgroundColor: "#a32126",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr style={{ height: "60px" }}>
                    <td colSpan="9" className="text-center">
                      No hay datos disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Paginación */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                style={{
                  backgroundColor: currentPage === 1 ? "#d3d3d3" : "#a32126",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                Anterior
              </button>
              <span style={{ fontWeight: "bold", textAlign: "center" }}></span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                style={{
                  backgroundColor: currentPage === totalPages ? "#d3d3d3" : "#a32126",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
MantenimientosPrincipal.propTypes = {
  onEdit: PropTypes.func,
};
MantenimientosPrincipal.defaultProps = {
  onEdit: () => {},
};
export default MantenimientosPrincipal;
