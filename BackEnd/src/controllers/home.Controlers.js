const connection = require('../models/db');

module.exports.getActivos = (req, res) => {
    const query = `
      SELECT 
    a.id_activo,
    a.numero_serie,
    a.nombre AS nombre_activo,
    a.tipo AS tipo_activo,
    a.estado,
    CONCAT(e.nombre_edificio, '/', l.nombre_laboratorio) AS ubicacion
FROM 
    Activos a
JOIN 
    Edificio_Laboratorio el ON a.id_ubicacion = el.id_laboratio_edificio
JOIN 
    Edificios e ON el.id_edificio = e.id_edificio
JOIN 
    Laboratorios l ON el.id_laboratorio = l.id_laboratorio
    ORDER by a.id_activo DESC;	
    `;

    try {
        connection.query(query, (err, results) => {
            if (err) {
                console.error("Error en la consulta:", err);
                return res.status(500).json({ error: "Error en la base de datos" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};
