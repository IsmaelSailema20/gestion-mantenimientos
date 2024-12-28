const connection = require("../models/db");

module.exports.getMantenimientos = (req, res) => {
  const query = `
    SELECT 
        m.id_mantenimiento AS numero,
        m.fecha_inicio AS inicio,
        m.fecha_fin AS fin,
        m.tipo AS tipo,
        dm.estado_mantenimiento AS estado,
        activos_agrupados.activos,
        m.observaciones AS descripcion,
        activos_agrupados.detalle
    FROM 
        mantenimientos m
    LEFT JOIN 
        (SELECT 
             dm.id_mantenimiento,
             COUNT(dm.id_activo) AS activos,
             GROUP_CONCAT(DISTINCT a.especificaciones SEPARATOR ', ') AS detalle
         FROM 
             detalle_mantenimiento dm
         LEFT JOIN 
             activos a ON dm.id_activo = a.id_activo
         GROUP BY 
             dm.id_mantenimiento) activos_agrupados 
    ON 
        m.id_mantenimiento = activos_agrupados.id_mantenimiento
    LEFT JOIN 
        detalle_mantenimiento dm ON m.id_mantenimiento = dm.id_mantenimiento
    ORDER BY 
        m.fecha_inicio DESC;
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error ejecutando la consulta:", err);
      res.status(500).json({ error: "Error al obtener los mantenimientos" });
      return;
    }

    console.log("Consulta ejecutada correctamente.");
    res.json(results); // Devuelve los datos al frontend
  });
};
