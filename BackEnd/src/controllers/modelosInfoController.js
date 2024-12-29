const connection = require('../models/db');

module.exports.getModelosInfo= (req, res) => {
    const query = `
    SELECT modelos.nombre AS modelo, tipos_activo.nombre AS tipo
    FROM modelos
    JOIN tipos_activo ON modelos.id_tipo = tipos_activo.id_tipo
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener los modelos:", err);
      return res.status(500).json({ error: "Error al obtener los modelos" });
    }
    res.status(200).json(results);
  });
};