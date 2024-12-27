const connection = require('../models/db');

module.exports.getMarcasPorActivo = (req, res) => {
    const { idActivo } = req.params;

    const query = `
        SELECT DISTINCT m.id_marca, m.nombre 
        FROM modelos mo 
        JOIN marcas m ON mo.id_marca = m.id_marca 
        WHERE mo.id_tipo = ?;
    `;

    try {
        connection.query(query, [idActivo], (err, results) => {
            if (err) {
                console.error("Error en la consulta de marcas:", err);
                return res.status(500).json({ error: "Error en la base de datos al obtener marcas" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ error: "Error en el servidor al obtener marcas" });
    }
};