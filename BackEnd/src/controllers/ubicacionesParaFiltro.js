const connection = require("../models/db");

// Obtener ubicaciones para el filtro
module.exports.ubicacionesParaFiltro = (req, res) => {
  const query = `
    SELECT CONCAT(e.nombre_edificio, '/', lab.nombre_laboratorio) AS ubicacion
    FROM edificio_laboratorio AS edf
    JOIN edificios AS e ON e.id_edificio = edf.id_edificio
    JOIN laboratorios AS lab ON lab.id_laboratorio = edf.id_laboratorio
    ORDER BY e.id_edificio;
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener ubicaciones:", err);
      return res.status(500).json({
        error: "Error al obtener las ubicaciones. Intenta nuevamente.",
      });
    }

    // Retornar las ubicaciones en formato JSON
    const ubicaciones = results.map((row) => row.ubicacion);
    res.status(200).json(ubicaciones);
  });
};
