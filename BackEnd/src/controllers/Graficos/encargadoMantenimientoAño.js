const connection = require("../../models/db");

module.exports.encargadoMantenimientoAño = (req, res) => {
  const { id_activo } = req.params; // Obtenemos el id_activo de los parámetros de la ruta

  if (!id_activo) {
    return res.status(400).json({ error: "El id_activo es obligatorio" });
  }

  const query = `
SELECT 
  YEAR(dm.fecha_inicio) AS anio,
  SUM(CASE WHEN m.ruc_empresa IS NOT NULL THEN 1 ELSE 0 END) AS cantidad_empresa,
  SUM(CASE WHEN m.cedula_laboratorista IS NOT NULL THEN 1 ELSE 0 END) AS cantidad_laboratorista
FROM detalle_mantenimiento dm
JOIN mantenimientos m ON dm.id_mantenimiento = m.id_mantenimiento
WHERE dm.id_activo = ? -- Filtrar por activo específico
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