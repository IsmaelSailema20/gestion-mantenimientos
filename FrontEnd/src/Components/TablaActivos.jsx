import PropTypes from "prop-types";
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
                <td>{activo.ubicacion}</td>
                <td>{capitalizeFirstLetter(activo.estado)}</td>
                <td className="text-center" style={{ padding: 0 }}>
                  <button
                    onClick={() => onEdit(activo)}
                    className="d-flex align-items-center justify-content-center"
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
                        marginRight: "8px",
                      }}
                    />
                    Actualizar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr style={{ height: "60px" }}>
              <td colSpan="6" className="text-center">
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
  activos: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
};
export default TablaActivos;
