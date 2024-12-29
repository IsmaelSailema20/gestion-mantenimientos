const connection = require('../models/db');

module.exports.getModelosPorMarca = (req, res) => {
    const { idMarca, idTipo } = req.query;

  //console.log("idMarca recibido:", idMarca);
  //console.log("idTipo recibido:", idTipo);

  if (!idMarca || !idTipo) {
    return res.status(400).json({ error: "Faltan parámetros idMarca o idTipo" });
  }

  const query = `
    SELECT id_modelo, nombre
    FROM modelos
    WHERE id_marca = ? AND id_tipo = ?
  `;

  connection.query(query, [idMarca, idTipo], (err, results) => {
    if (err) {
      console.error("Error al obtener los modelos:", err);
      return res.status(500).json({ error: "Error al obtener los modelos" });
    }

    res.status(200).json(results);
  });
};
