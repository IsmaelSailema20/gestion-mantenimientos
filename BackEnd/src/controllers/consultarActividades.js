const connection = require('../models/db');

module.exports.consultarActividades = (req, res) => {
    const query = `
SELECT * FROM catalogoactividades;
  `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener activos del mantenimiento:", err);
            return res.status(500).json({ error: "Error al obtener activos del mantenimiento" });
        }
        res.status(200).json(results);
    });
};
