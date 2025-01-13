const connection = require("../../models/db");

module.exports.frecuenciaMantenimientos = (req, res) => {
  const { id_activo } = req.params; // Obtenemos el id_activo de los parámetros de la ruta

  if (!id_activo) {
    return res.status(400).json({ error: "El id_activo es obligatorio" });
  }

  const query = `
   
SELECT 
  DATE_FORMAT(fecha_inicio, '%Y') AS anio,
  COUNT(*) AS cantidad
FROM detalle_mantenimiento
WHERE id_activo = ?
GROUP BY anio
ORDER BY anio;
  `;

  try {
    connection.query(query, [id_activo], (err, results) => {
      if (err) {
        console.error("Error en la consulta:", err);
        return res.status(500).json({ error: "Error en la base de datos" });
      }

      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};