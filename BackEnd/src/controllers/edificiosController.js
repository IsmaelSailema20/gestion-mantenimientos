const connection = require('../models/db');  // Asegúrate de tener la conexión a la base de datos

module.exports.getEdificios = (req, res) => {
  const query = `SELECT * FROM Edificios`;  // Consulta para obtener todos los edificios

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener edificios:", err);
      return res.status(500).json({ error: "Error al obtener edificios" });
    }
    res.status(200).json(results);  // Devuelve los edificios como respuesta
  });
};
