const connection = require("../models/db");

// Obtener proveedores para el filtro
module.exports.proveedoresParaFiltro = (req, res) => {
  const query = `
   SELECT nombre FROM proveedores;
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener proveedores:", err);
      return res.status(500).json({
        error: "Error al obtener las proveedores. Intenta nuevamente.",
      });
    }

    // Retornar las proveedores en formato JSON
    const proveedores = results.map((row) => row.nombre);
    res.status(200).json(proveedores);
  });
};
