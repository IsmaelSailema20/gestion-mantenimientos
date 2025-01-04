const connection = require('../models/db');

module.exports.consultarMantenimiento = (req, res) => {
    const { id } = req.body

    const query = `
SELECT * FROM mantenimientos where id_mantenimiento= ?;
  `;

    connection.query(query,[id] ,(err, results) => {
        if (err) {
            console.error("Error al obtener activos del mantenimiento:", err);
            return res.status(500).json({ error: "Error al obtener activos del mantenimiento" });
        }
        res.status(200).json(results);
    });
};