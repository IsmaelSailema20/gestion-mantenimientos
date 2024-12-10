const connection = require('../models/db');

module.exports.getActivos = (req, res) => {
    const query = `
        SELECT 
	a.id_activo as id,
            a.numero_serie AS Codigo,
            a.nombre AS Nombre,
            a.tipo AS Tipo,
            u.nombre AS Ubicación,
            a.estado AS Estado
        FROM 
            activos a
        LEFT JOIN 
            ubicaciones u ON a.id_ubicacion = u.id_ubicacion
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
