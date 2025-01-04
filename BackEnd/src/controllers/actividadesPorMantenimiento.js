const connection = require('../models/db');

module.exports.actividadesPorMantenimiento = (req, res) => {
    const { id } = req.body
    const query = `
  SELECT ca.nombre AS actividad, COUNT(a.id_activo) AS cantidad_activos
FROM actividades_mantenimiento am
JOIN catalogoactividades ca ON am.tipo_actividad = ca.id
JOIN detalle_mantenimiento dm ON am.id_detalle_mantenimiento = dm.id_detalle_mantenimiento
JOIN activos a ON dm.id_activo = a.id_activo
WHERE dm.id_mantenimiento = ?
GROUP BY ca.nombre;
  `;


    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error al obtener activos del mantenimiento:", err);
            return res.status(500).json({ error: "Error al obtener activos del mantenimiento" });
        }
        res.status(200).json(results);
    });
};
