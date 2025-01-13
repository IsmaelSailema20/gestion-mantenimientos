const connection = require('../models/db');

module.exports.getActivosDisponibles = (req, res) => {
  const query = `
      SELECT 
    a.id_activo,
    a.numero_serie,
    a.tipo,
    a.estado ,
    p.nombre AS proveedor,
    ta.nombre AS clase,
    CONCAT(e.nombre_edificio, '/', l.nombre_laboratorio) AS ubicacion,
    a.fecha_registro
FROM 
    activos a
    JOIN modelos mo ON a.id_modelo = mo.id_modelo 
    JOIN tipos_activo ta ON mo.id_tipo = ta.id_tipo 

JOIN 
    edificio_laboratorio el ON a.id_ubicacion = el.id_laboratio_edificio
JOIN 
    edificios e ON el.id_edificio = e.id_edificio
JOIN 
    laboratorios l ON el.id_laboratorio = l.id_laboratorio
JOIN 
	proveedores p on a.id_proveedor = p.id_proveedor
WHERE 
    a.id_activo NOT IN (
        SELECT id_activo 
        FROM detalle_mantenimiento 
        WHERE estado_mantenimiento != 'finalizado'
    )
        ORDER BY fecha_registro DESC
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
