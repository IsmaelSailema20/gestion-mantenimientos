const connection = require('../models/db');

module.exports.actividadesPorActivo = (req, res) => {
    const { id } = req.body
    const query = `
 SELECT 
    am.id_actividad AS id,
    ca.nombre AS nombre,
    ca.descripcion AS descripcion
FROM 
    actividades_mantenimiento am
    
JOIN 
    catalogoactividades ca ON am.tipo_actividad = ca.id
   
WHERE 
    am.id_detalle_mantenimiento = ?;

  `;


    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error al obtener actividades del activo:", err);
            return res.status(500).json({ error: "Error al obtener actividades del activo" });
        }
        res.status(200).json(results);
    });
};
