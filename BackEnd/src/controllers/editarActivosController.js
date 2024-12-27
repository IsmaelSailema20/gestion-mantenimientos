const connection = require('../models/db');

module.exports.actualizarActivos = (req, res) => {
  const { id_activo } = req.params; // Obtén el ID del activo desde los parámetros
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
    observaciones,
  } = req.body;

  // Función para actualizar el activo
  const actualizarActivo = (ubicacionId) => {
    const updateActivoQuery = `
      UPDATE Activos
      SET
        numero_serie = ?,
        proceso_compra = ?,
        tipo = ?,
        estado = ?,
        id_ubicacion = ?,
        id_proveedor = ?,
        id_modelo = ?,
        id_laboratorista = ?,
        especificaciones = ?,
        observaciones = ?
      WHERE
        id_activo = ?
    `;

    connection.query(
      updateActivoQuery,
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
        observaciones,
        id_activo, // ID del activo que se está actualizando (desde req.params)
      ],
      (err, activoResults) => {
        if (err) {
          console.error("Error al actualizar el activo:", err);
          return res.status(500).json({ error: "Error al actualizar el activo" });
        }
        res
          .status(200)
          .json({ message: "Activo actualizado con éxito", data: activoResults });
      }
    );
  };

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
        console.error("Error al verificar la relación de ubicación:", err);
        return res.status(500).json({ error: "Error al verificar la relación de ubicación" });
      }

      let idUbicacion = null;

      if (ubicacionResults.length > 0) {
        // Si existe, obtenemos el ID de la ubicación
        idUbicacion = ubicacionResults[0].id_laboratio_edificio;
        actualizarActivo(idUbicacion); // Continuar con la actualización del activo
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
            actualizarActivo(idUbicacion); // Continuar con la actualización del activo
          }
        );
      }
    }
  );
};
