import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import FormularioMantenimiento from "../Components/FormularioMantenimiento";

const MantenimientosPrincipal = ({ onEdit }) => {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    numero: "",
    estado: "",
    activos: "",
    tipo: "",
    inicio: "",
    fin: "",
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [mostrarRegFormulario, setMostrarRegFormulario] = useState(false);
  const handleMostrarRegFormulario = () => {
    setMostrarRegFormulario(true);
  };
  useEffect(() => {
    cargarMantenimientos();
  }, []);
  const cargarMantenimientos = async () => {
    try {
      const response = await axios.get("http://localhost:5000/mantenimientos");
      setMantenimientos(response.data);
    } catch (error) {
      console.error("Error al cargar los mantenimientos", error);
    }
  };

  const cerrarFormulario = () => {
    setMostrarRegFormulario(false);
  };
  const fetchMantenimientos = async () => {
    try {
      const response = await axios.get("http://localhost:5000/mantenimientos");
      setMantenimientos(response.data);
      setIsLoading(false);
    } catch (error) {
      setError("Error al obtener los datos del servidor");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMantenimientos();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const toggleFilterDropdown = () => {
    setShowFilterDropdown(!showFilterDropdown);
  };

  const filteredMantenimientos = mantenimientos.filter((mantenimiento) => {
    return (
      (filters.numero === "" ||
        mantenimiento.numero.toString().includes(filters.numero)) &&
      (filters.estado === "" ||
        mantenimiento.estado.includes(filters.estado)) &&
      (filters.activos === "" ||
        mantenimiento.activos.toString().includes(filters.activos)) &&
      (filters.tipo === "" || mantenimiento.tipo.includes(filters.tipo)) &&
      (filters.inicio === "" || mantenimiento.inicio >= filters.inicio) &&
      (filters.fin === "" || mantenimiento.fin <= filters.fin)
    );
  });
  const agregarMantenimiento = (nuevoMantenimiento) => {
    setMantenimientos((prevMantenimientos) => [
      ...prevMantenimientos,
      nuevoMantenimiento,
    ]);
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
          onClick={handleMostrarRegFormulario}
        >
          Crear Mantenimiento
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="d-flex flex-wrap gap-4 mb-3">
        <div className="d-flex align-items-center gap-3">
          {/* Buscador */}
          <div
            className="d-flex align-items-center"
            style={{ position: "relative", width: "250px" }}
          >
            <input
              type="text"
              placeholder="Search"
              style={{
                border: "5px solid #a32126",
                borderRadius: "20px",
                padding: "5px 25px",
                width: "100%",
              }}
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
          {/* Icono de filtración */}
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
                  <input
                    type="text"
                    name="numero"
                    placeholder="Número de mantenimiento"
                    value={filters.numero}
                    onChange={handleFilterChange}
                    className="form-control"
                    style={{
                      borderRadius: "10px",
                      padding: "10px",
                      border: "1px solid black",
                      width: "300px",
                    }}
                  />
                  <input
                    type="text"
                    name="estado"
                    placeholder="Estado"
                    value={filters.estado}
                    onChange={handleFilterChange}
                    className="form-control"
                    style={{
                      borderRadius: "10px",
                      padding: "10px",
                      border: "1px solid black",
                      width: "300px",
                    }}
                  />
                  <input
                    type="text"
                    name="activos"
                    placeholder="N° de activos"
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
                  <input
                    type="text"
                    name="tipo"
                    placeholder="Tipo de mantenimiento"
                    value={filters.tipo}
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
      {mostrarRegFormulario && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div
            className="modal-dialog"
            style={{ maxWidth: "1000px", maxHeight: "1000px" }}
          >
            <div className="modal-content">
              <div className="modal-body">
                <FormularioMantenimiento
                  closeModal={cerrarFormulario}
                  recargarTabla={cargarMantenimientos}
                  />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="table-responsive">
        {isLoading ? (
          <p>Cargando datos...</p>
        ) : error ? (
          <p>Error al cargar datos: {error}</p>
        ) : (
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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody style={{ textAlign: "center" }}>
              {filteredMantenimientos.length > 0 ? (
                filteredMantenimientos.map((mantenimiento, index) => (
                  <tr key={index} style={{ height: "60px" }}>
                    <td>{mantenimiento.numero}</td>
                    <td>{mantenimiento.inicio}</td>
                    <td>{mantenimiento.fin}</td>
                    <td>{mantenimiento.estado}</td>
                    <td>{mantenimiento.activos}</td>
                    <td>{mantenimiento.tipo}</td>
                    <td>{mantenimiento.descripcion}</td>
                    <td>{mantenimiento.detalle}</td>
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
