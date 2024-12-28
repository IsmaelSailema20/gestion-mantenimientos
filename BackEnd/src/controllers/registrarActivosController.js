const connection = require('../models/db');

module.exports.registrarActivos = (req, res) => {
  const {
    numeroSerie,
    procesoCompra,
    tipo,
    estado,
    id_proveedor,
    id_laboratorio,
    id_ubicacion,
    id_modelo,
    id_laboratorista,
    especificaciones,
    observaciones
  } = req.body;

  // Verificamos si la ubicación (bloque + laboratorio) ya existe en la tabla
  const checkUbicacionQuery = `
    SELECT id_laboratio_edificio 
    FROM Edificio_Laboratorio 
    WHERE id_edificio = ? AND id_laboratorio = ?
  `;

  connection.query(
    checkUbicacionQuery,
    [id_ubicacion, id_laboratorio],
    (err, ubicacionResults) => {
      if (err) {
        console.error("Error al verificar la relación:", err);
        return res.status(500).json({ error: "Error al verificar la relación de ubicación" });
      }

      let idUbicacion = null;

      if (ubicacionResults.length > 0) {
        // Si existe, obtenemos el ID de la ubicación
        idUbicacion = ubicacionResults[0].id_laboratio_edificio;
      } else {
        // Si no existe, creamos una nueva ubicación
        const insertUbicacionQuery = `
          INSERT INTO Edificio_Laboratorio (id_edificio, id_laboratorio)
          VALUES (?, ?)
        `;

        connection.query(
          insertUbicacionQuery,
          [id_ubicacion, id_laboratorio],
          (err, insertResults) => {
            if (err) {
              console.error("Error al insertar la ubicación:", err);
              return res.status(500).json({ error: "Error al insertar la relación de ubicación" });
            }
            idUbicacion = insertResults.insertId;
            insertarActivo(idUbicacion); // Continuar con la inserción del activo
          }
        );
      }

      // Función para insertar el activo
      const insertarActivo = (ubicacionId) => {
        const insertActivoQuery = `
          INSERT INTO Activos (
            numero_serie, proceso_compra, tipo, estado, 
            id_ubicacion, id_proveedor, id_modelo, id_laboratorista,especificaciones,observaciones
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        connection.query(
          insertActivoQuery,
          [
            numeroSerie,
            procesoCompra,
            tipo,
            estado,
            ubicacionId,
            id_proveedor,
            id_modelo,
            id_laboratorista,
            especificaciones,
            observaciones
          ],
          (err, activoResults) => {
            if (err) {
              console.error("Error al insertar el activo:", err);
              return res.status(500).json({ error: "Error al registrar el activo" });
            }
            res
              .status(201)
              .json({ message: "Activo registrado con éxito", data: activoResults });
          }
        );
      };

      // Si ya existe la ubicación, insertamos directamente el activo
      if (idUbicacion) {
        insertarActivo(idUbicacion);
      }
    }
  );
};
