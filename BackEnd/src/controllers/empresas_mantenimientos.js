const connection = require('../models/db');

module.exports.empresas_mantenimientos = (req, res) => {
    const query = `
        SELECT * FROM gestionactivos.empresas_mantenimientos;
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