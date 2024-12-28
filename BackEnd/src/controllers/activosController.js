const connection = require('../models/db');

module.exports.getActivosDisponibles = (req, res) => {
  const query = `
    SELECT 
    a.id_activo,
    a.numero_serie,
       a.tipo,  
    a.estado ,
    ta.nombre AS tipo_activo,
    CONCAT(e.nombre_edificio, '/', l.nombre_laboratorio) AS ubicacion,
    a.fecha_registro
FROM 
    activos a
JOIN 
    tipos_activo ta ON a.tipo = ta.id_tipo
JOIN 
    edificio_laboratorio el ON a.id_ubicacion = el.id_laboratio_edificio
JOIN 
    edificios e ON el.id_edificio = e.id_edificio
JOIN 
    laboratorios l ON el.id_laboratorio = l.id_laboratorio
WHERE 
    a.id_activo NOT IN (
        SELECT id_activo 
        FROM detalle_mantenimiento 
        WHERE estado_mantenimiento != 'finalizado'
    )
;

  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener activos disponibles:", err);
      return res.status(500).json({ error: "Error al obtener activos disponibles" });
    }
    res.status(200).json(results);
  });
};
