// Suponiendo que tienes una conexión a tu base de datos
const connection = require('../models/db');

// Obtener laboratorios por bloque
module.exports.getLaboratoriosPorBloque = (req, res) => {
  const idEdificio = req.params.idEdificio;

  const query = `
    SELECT L.id_laboratorio, L.nombre_laboratorio 
    FROM Laboratorios L
    INNER JOIN Edificio_Laboratorio EL ON EL.id_laboratorio = L.id_laboratorio
    WHERE EL.id_edificio = ?
  `;

  connection.query(query, [idEdificio], (err, results) => {
    if (err) {
      console.error("Error al obtener laboratorios:", err);
      return res.status(500).json({ error: "Error al obtener laboratorios" });
    }
    res.status(200).json(results);
  });
};
