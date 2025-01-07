const connection = require("../models/db");

module.exports.getMantenimientos = (req, res) => {
  const { codigo, estado, activos, tipo, inicio, fin } = req.query;
  let whereClauses = [];
  if (codigo) whereClauses.push(`m.codigo_mantenimiento  LIKE ${connection.escape('%'+ codigo + '%')}`);
  if (estado) whereClauses.push(`dm.estado_mantenimiento LIKE ${connection.escape('%' + estado + '%')}`);
  if (activos) whereClauses.push(`activos_agrupados.activos = ${connection.escape(activos)}`);
  if (tipo) whereClauses.push(`m.tipo LIKE ${connection.escape('%' + tipo + '%')}`);
  if (inicio) whereClauses.push(`DATE(m.fecha_inicio) = ${connection.escape(inicio)}`);
  if (fin) whereClauses.push(`DATE(m.fecha_fin) = ${connection.escape(fin)}`);
  const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    
  const query = `
    SELECT 
    @row_number := @row_number + 1 AS orden, 
    m.id_mantenimiento AS numero,  
    m.codigo_mantenimiento AS codigo,
    DATE_FORMAT(m.fecha_inicio, '%Y-%m-%d') AS inicio, 
    DATE_FORMAT(m.fecha_fin, '%Y-%m-%d') AS fin,  
    m.tipo AS tipo,
    dm.estado_mantenimiento AS estado,
    activos_agrupados.activos,
    m.observaciones AS descripcion,
    activos_agrupados.detalle
FROM 
    (SELECT @row_number := 0) r, -- Inicializar la variable para numeración
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
    (SELECT 
         DISTINCT dm.id_mantenimiento,
         dm.estado_mantenimiento
     FROM 
         detalle_mantenimiento dm
    ) dm 
ON 
    m.id_mantenimiento = dm.id_mantenimiento
${where} -- Aplicar filtros dinámicos aquí
GROUP BY 
    m.id_mantenimiento, 
    m.fecha_inicio, 
    m.fecha_fin, 
    m.tipo, 
    dm.estado_mantenimiento, 
    activos_agrupados.activos, 
    m.observaciones, 
    activos_agrupados.detalle
ORDER BY 
    m.id_mantenimiento ASC;

  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error ejecutando la consulta:", err);
      res.status(500).json({ error: "Error al obtener los mantenimientos" });
      return;
    }
    res.json(results); // Devuelve los datos al frontend
  });
};