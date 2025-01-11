const connection = require("../models/db");

// Obtener proveedores para el filtro
module.exports.claseParaFiltro = (req, res) => {
  const query = `
   SELECT nombre FROM tipos_activo;
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener la clase:", err);
      return res.status(500).json({
        error: "Error al obtener las clases . Intenta nuevamente.",
      });
    }

    // Retornar las  en formato JSON
    const claseActivo = results.map((row) => row.nombre);
    res.status(200).json(claseActivo);
  });
}