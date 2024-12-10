import PropTypes from "prop-types";

const TablaActivos = ({ activos }) => {
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
            <th>Nombre</th>
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
                <td>{activo.Codigo}</td>
                <td>{activo.Nombre}</td>
                <td>{activo.Tipo}</td>
                <td>{activo.Ubicación}</td>
                <td>{activo.Estado}</td>
                <td className="text-center">
                  <button
                    className="btn d-flex align-items-center"
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      padding: 0,
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
};
export default TablaActivos;
