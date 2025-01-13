import PropTypes from "prop-types";
import GenerarPDF from "./GenerarPDF";

function capitalizeFirstLetter(str) {
  if (!str) return ""; // Manejar cadenas vacías
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const TablaActivos = ({ activos, onEdit }) => {
  return (
    <div className="table-responsive">
      <table
        className="table-bordered"
        style={{ border: "2px solid black", width: "100%" }}
      >
        <thead
          className="p-4"
          style={{
            backgroundColor: "#921c21",
            height: "50px",
            color: "white",
            textAlign: "center",
          }}
        >
          <tr>
            <th>Codigo</th>
            <th>Activo</th>
            <th>Tipo</th>
            <th>Fecha De Registro</th>
            <th>Ubicación</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody style={{ textAlign: "center" }}>
          {activos.length > 0 ? (
            activos.map((activo, index) => (
              <tr key={index} style={{ height: "60px" }}>
                <td>{activo.numero_serie}</td>
                <td>{activo.nombre_activo}</td>
                <td>{capitalizeFirstLetter(activo.tipo_activo)}</td>
                <td>{activo.fecha_registro}</td>
                <td>{activo.ubicacion}</td>
                <td>{capitalizeFirstLetter(activo.estado)}</td>
                <td className="text-center" style={{ padding: 0 }}>
                  <div className="d-flex justify-content-around mt-3 mb-3">
                    {/* Botón Actualizar */}
                    <button
                      onClick={() => onEdit(activo)}
                      className="d-flex flex-column align-items-center justify-content-center"
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        padding: 0,
                        width: "100%",
                      }}
                    >
                      <img
                        src="/actualizar.png"
                        alt="Actualizar"
                        style={{
                          width: "44px",
                          height: "34px",
                        }}
                      />
                      <span style={{ fontSize: "14px", marginTop: "5px" }}>
                        Actualizar
                      </span>
                    </button>

                    {/* Botón Informes */}
                    {/* Gráfico y PDF */}

                    <GenerarPDF activo={activo} />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr style={{ height: "60px" }}>
              <td colSpan="7" className="text-center">
                No hay datos disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

TablaActivos.propTypes = {
  activos: PropTypes.arrayOf(
    PropTypes.shape({
      id_activo: PropTypes.number.isRequired,
      numero_serie: PropTypes.string.isRequired,
      nombre_activo: PropTypes.string.isRequired,
      tipo_activo: PropTypes.string.isRequired,
      estado: PropTypes.string.isRequired,
      fecha_registro: PropTypes.string.isRequired,
      ubicacion: PropTypes.string.isRequired,
      laboratorista: PropTypes.string.isRequired,
      nombre_marca: PropTypes.string.isRequired,
      especificaciones: PropTypes.string,
      observaciones: PropTypes.string,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default TablaActivos;
