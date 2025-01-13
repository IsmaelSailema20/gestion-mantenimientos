const connection = require("../models/db");

module.exports.componentesActivos = (req, res) => {
  const { id_activo } = req.params; // Obtenemos el id_activo de los parámetros de la ruta

  if (!id_activo) {
    return res.status(400).json({ error: "El id_activo es obligatorio" });
  }

  const query = `
    SELECT acc.id_activo, ci.nombre_componente
    FROM activos_componentes as acc
    JOIN activos act ON act.id_activo = acc.id_activo
    JOIN componentes_internos ci ON acc.id_componente = ci.id_componente
    WHERE acc.id_activo = ?
  `;

  try {
    connection.query(query, [id_activo], (err, results) => {
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
