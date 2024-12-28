const connection = require('../models/db');

module.exports.getModelosPorMarca = (req, res) => {
    const { idMarca } = req.params;

    const query = `
        SELECT id_modelo, nombre 
        FROM modelos 
        WHERE id_marca = ?;
    `;

    try {
        connection.query(query, [idMarca], (err, results) => {
            if (err) {
                console.error("Error en la consulta de modelos:", err);
                return res.status(500).json({ error: "Error en la base de datos al obtener modelos" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ error: "Error en el servidor al obtener modelos" });
    }
};
