const connection = require("../models/db"); // Conexión a la base de datos

// Consulta de actividades
module.exports.getActividades = (req, res) => {
  const query = `
    SELECT 
      id, 
      nombre 
    FROM 
    catalogoactividades
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener actividades:", err);
      return res.status(500).json({ error: "Error al obtener actividades" });
    }
    res.status(200).json(results);
  });
};

// Consulta de encargados (Empresas o Laboratoristas)
module.exports.getEncargados = (req, res) => {
  const { tipo } = req.query; // Tipo recibido como parámetro: "Laboratorista" o "Empresa"

  let query;
  if (tipo === "Empresa") {
    query = `
      SELECT 
        ruc AS id,
        nombre 
      FROM 
    empresas_mantenimientos
    `;
  } else if (tipo === "Laboratorista") {
    query = `
      SELECT 
        cedula AS id,
        CONCAT(nombre, ' ', apellido) AS nombre 
      FROM 
       laboratoristas
    `;
  } else {
    return res.status(400).json({ error: "Tipo de encargado no válido" });
  }

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener encargados:", err);
      return res.status(500).json({ error: "Error al obtener encargados" });
    }
    res.status(200).json(results);
  });
};
module.exports.getTiposMantenimientos = (req, res) => {
  const query = `
SELECT DISTINCT 
    tipo 
FROM 
    mantenimientos;

    `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener tipos de mantenimiento:", err);
      return res
        .status(500)
        .json({ error: "Error al obtener tipos de mantenimiento" });
    }
    res.status(200).json(results);
  });
};
module.exports.getClases = (req, res) => {
    const query = `
      SELECT 
        id_tipo AS id,
        nombre 
      FROM 
        tipos_activo;
    `;
  
    connection.query(query, (err, results) => {
      if (err) {
        console.error("Error al obtener clases:", err);
        return res.status(500).json({ error: "Error al obtener clases" });
      }
      res.status(200).json(results);
    });
  };