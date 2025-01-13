const connection = require("../../models/db");

module.exports.getTiposMantenimientosPorMes = (req, res) => {
  const { id_activo } = req.params;

  const query = `
   SELECT 
  CASE 
    WHEN mes = 1 THEN 'Enero'
    WHEN mes = 2 THEN 'Febrero'
    WHEN mes = 3 THEN 'Marzo'
    WHEN mes = 4 THEN 'Abril'
    WHEN mes = 5 THEN 'Mayo'
    WHEN mes = 6 THEN 'Junio'
    WHEN mes = 7 THEN 'Julio'
    WHEN mes = 8 THEN 'Agosto'
    WHEN mes = 9 THEN 'Septiembre'
    WHEN mes = 10 THEN 'Octubre'
    WHEN mes = 11 THEN 'Noviembre'
    WHEN mes = 12 THEN 'Diciembre'
  END AS mes,
  COUNT(*) AS cantidad_mantenimientos
FROM (
  SELECT 
    MONTH(dm.fecha_inicio) AS mes
  FROM detalle_mantenimiento dm
  WHERE dm.id_activo = ? AND YEAR(dm.fecha_inicio) = YEAR(CURDATE())
) AS subquery
GROUP BY mes
ORDER BY mes;
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
