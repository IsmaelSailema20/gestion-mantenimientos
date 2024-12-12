const connection = require('../models/db');

module.exports.registrarActivos = (req, res) => {
  const {
    nombreActivo,
    modelo,
    marca,
    tipoActivo,
    numeroSerie,
    procesoCompra,
    proveedor,
    bloque,  // id_edificio
    laboratorio,  // id_laboratorio
    estado,
    especificaciones,
    observaciones,
    encargado,
  } = req.body;

  // Primero, verifiquemos si ya existe la relación entre bloque (id_edificio) y laboratorio (id_laboratorio)
  const checkQuery = `
    SELECT id_laboratio_edificio
    FROM Edificio_Laboratorio
    WHERE id_edificio = ? AND id_laboratorio = ?
  `;

  connection.query(checkQuery, [bloque, laboratorio], (err, results) => {
    if (err) {
      console.error("Error al verificar la relación:", err);
      return res.status(500).json({ error: "Error al verificar la relación" });
    }

    let idUbicacion = null;

    if (results.length > 0) {
      // Si existe, usamos la relación existente
      idUbicacion = results[0].id_laboratio_edificio;
    } else {
      // Si no existe, insertamos una nueva relación
      const insertQuery = `
        INSERT INTO Edificio_Laboratorio (id_edificio, id_laboratorio)
        VALUES (?, ?)
      `;

      connection.query(insertQuery, [bloque, laboratorio], (err, insertResults) => {
        if (err) {
          console.error("Error al insertar relación:", err);
          return res.status(500).json({ error: "Error al insertar relación" });
        }

        // Obtenemos el id de la nueva relación
        idUbicacion = insertResults.insertId;
      });
    }

    // Ahora insertamos el nuevo activo en la tabla Activos
    const query = `
      INSERT INTO Activos (
        numero_serie, nombre, modelo, marca, proceso_compra, tipo, estado, 
        id_ubicacion, id_proveedor, especificaciones, observaciones, id_laboratorista
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `;

    connection.query(
      query,
      [
        numeroSerie,
        nombreActivo,
        modelo,
        marca,
        procesoCompra,
        tipoActivo,
        estado,
        idUbicacion,  // Usamos el id_laboratio_edificio (id_ubicacion)
        proveedor,
        especificaciones,
        observaciones,
        encargado,
      ],
      (err, results) => {
        if (err) {
          console.error("Error al guardar el activo:", err);
          return res.status(500).json({ error: "Error al guardar el activo" });
        }
        res.status(201).json({ message: "Activo registrado con éxito", data: results });
      }
    );
  });
};
