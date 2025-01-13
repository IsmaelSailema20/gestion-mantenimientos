const connection = require("../../models/db");

module.exports.mantenimientosPorAnio = (req, res) => {
  const { id_activo } = req.params;

  const query = `
 SELECT 
  YEAR(dm.fecha_inicio) AS anio,
  SUM(CASE WHEN m.tipo = 'preventivo' THEN 1 ELSE 0 END) AS cantidad_preventivo,
  SUM(CASE WHEN m.tipo = 'correctivo' THEN 1 ELSE 0 END) AS cantidad_correctivo
FROM detalle_mantenimiento dm
JOIN mantenimientos m ON dm.id_mantenimiento = m.id_mantenimiento
WHERE dm.id_activo = ? -- Filtrar por activo específico
GROUP BY anio
ORDER BY anio;

  `;

  connection.query(query, [id_activo], (err, results) => {
    if (err) {
      console.error("Error al obtener los datos:", err);
      res.status(500).json({ error: "Error en la base de datos" });
    } else {
      res.status(200).json(results);
    }
  });
};
