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
    ma.nombre as marca,
    prov.nombre as proveedor,
    ta.nombre as tipo_activo,
    CONCAT(e.nombre_edificio, '/', l.nombre_laboratorio) AS ubicacion

FROM 
    activos a
    JOIN 
    Edificio_Laboratorio el ON a.id_ubicacion = el.id_laboratio_edificio
     JOIN 
    Edificios e ON el.id_edificio = e.id_edificio
JOIN 
    Laboratorios l ON el.id_laboratorio = l.id_laboratorio
JOIN 
    modelos mo ON a.id_modelo = mo.id_modelo
JOIN 
    tipos_activo ta ON mo.id_tipo = ta.id_tipo
     join 
    marcas ma on mo.id_marca = ma.id_marca
    JOIN proveedores prov ON prov.id_proveedor = a.id_proveedor
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
