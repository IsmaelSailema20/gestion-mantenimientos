const connection = require("../models/db");

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
    observaciones,
    componentes, // IDs de componentes del CPU
  } = req.body;
  console.log("Componentes recibidos:", componentes);
  // Iniciar la transacción
  connection.beginTransaction((err) => {
    if (err) {
      console.error("Error al iniciar la transacción:", err);
      return res.status(500).json({ error: "Error al iniciar la transacción" });
    }

    // Función para insertar componentes relacionados con el activo
    const insertarComponentes = (idActivo, componentes, callback) => {
      const insertComponentesQuery = `
        INSERT INTO activos_componentes (id_activo, id_componente)
        VALUES ?
      `;

      const values = componentes.map((idComponente) => [idActivo, idComponente]);

      connection.query(insertComponentesQuery, [values], (err) => {
        if (err) {
          console.error("Error al insertar componentes:", err);
          return callback(err);
        }

        callback(null); // Todo bien, continuar
      });
    };

    // Función para insertar el activo
    const insertarActivo = (ubicacionId, callback) => {
      const insertActivoQuery = `
        INSERT INTO Activos (
          numero_serie, proceso_compra, tipo, estado,
          id_ubicacion, id_proveedor, id_modelo, id_laboratorista,
          especificaciones, observaciones
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
          observaciones,
        ],
        (err, results) => {
          if (err) {
            console.error("Error al insertar el activo:", err);
            return callback(err);
          }

          const idActivo = results.insertId; // ID del activo recién creado
          insertarComponentes(idActivo, componentes, callback);
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
          return connection.rollback(() => {
            res.status(500).json({ error: "Error al verificar la relación de ubicación" });
          });
        }

        let idUbicacion = null;

        if (ubicacionResults.length > 0) {
          // Si existe, obtenemos el ID de la ubicación
          idUbicacion = ubicacionResults[0].id_laboratio_edificio;
          insertarActivo(idUbicacion, (err) => {
            if (err) {
              return connection.rollback(() => {
                res.status(500).json({ error: "Error al registrar el activo y componentes" });
              });
            }

            // Confirmar transacción
            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  res.status(500).json({ error: "Error al confirmar la transacción" });
                });
              }

              res.status(201).json({ message: "Activo y componentes registrados con éxito" });
            });
          });
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
                return connection.rollback(() => {
                  res.status(500).json({ error: "Error al insertar la relación de ubicación" });
                });
              }

              idUbicacion = insertResults.insertId;
              insertarActivo(idUbicacion, (err) => {
                if (err) {
                  return connection.rollback(() => {
                    res.status(500).json({ error: "Error al registrar el activo y componentes" });
                  });
                }

                // Confirmar transacción
                connection.commit((err) => {
                  if (err) {
                    return connection.rollback(() => {
                      res.status(500).json({ error: "Error al confirmar la transacción" });
                    });
                  }

                  res.status(201).json({ message: "Activo y componentes registrados con éxito" });
                });
              });
            }
          );
        }
      }
    );
  });
};
