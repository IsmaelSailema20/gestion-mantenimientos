const connection = require('../models/db');

module.exports.actividadesRealizadas = (req, res) => {
    const { id } = req.body
    const query = `
SELECT 
    am.id_actividad AS id_actividad_mantenimiento,
    dm.id_detalle_mantenimiento,
    dm.estado_mantenimiento,
    dm.fecha_inicio,
    dm.fecha_fin,
    ca.nombre AS nombre,
    ca.descripcion AS descripcion_actividad,
      ca.id AS id

FROM 
    detalle_mantenimiento dm
JOIN 
    actividades_mantenimiento am ON dm.id_detalle_mantenimiento = am.id_detalle_mantenimiento
JOIN 
    catalogoactividades ca ON am.tipo_actividad = ca.id
WHERE 
    dm.id_detalle_mantenimiento = ?;

  `;


    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error al obtener actividades del activo:", err);
            return res.status(500).json({ error: "Error al obtener actividades del activo" });
        }
        res.status(200).json(results);
    });
};
