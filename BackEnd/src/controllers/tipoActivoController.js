const connection = require('../models/db');  // Asegúrate de tener la conexión a la base de datos

module.exports.getTipoActivos = (req, res) => {
  const query = `SELECT * FROM tipos_activo`;  // Consulta para obtener todos los tipos activos

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener tipos activos:", err);
      return res.status(500).json({ error: "Error al obtener tipos activos" });
    }
    res.status(200).json(results);  // Devuelve los tipos activos como respuesta
  });
};
