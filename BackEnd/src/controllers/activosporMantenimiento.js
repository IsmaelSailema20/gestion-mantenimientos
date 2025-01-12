const connection = require('../models/db');

module.exports.activosporMantenimiento = (req, res) => {
    const { id } = req.body
    const query = `
  SELECT 
    a.id_activo,
    a.numero_serie,
    a.tipo,
    a.estado,
    ta.nombre AS tipo_activo,
    a.fecha_registro,
    dm.estado_mantenimiento,
    m.fecha_fin,
    dm.id_detalle_mantenimiento as detalle_mantenimiento,
    mo.nombre as modelo,
            ma.nombre as marca

FROM 
    activos a
JOIN 
    modelos mo ON a.id_modelo = mo.id_modelo
JOIN 
    tipos_activo ta ON mo.id_tipo = ta.id_tipo
     join 
    marcas ma on mo.id_marca = ma.id_marca
LEFT JOIN 
    detalle_mantenimiento dm ON a.id_activo = dm.id_activo
LEFT JOIN 
    mantenimientos m ON dm.id_mantenimiento = m.id_mantenimiento
WHERE 
    dm.id_mantenimiento  = ?
  `;


    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error al obtener activos del mantenimiento:", err);
            return res.status(500).json({ error: "Error al obtener activos del mantenimiento" });
        }
        res.status(200).json(results);
    });
};
