const connection = require('../models/db');

module.exports.loteController = async (req, res) => {
    const activos = req.body;
    const obtenerIdPorNombre = (query, params) =>
        new Promise((resolve, reject) => {
            connection.query(query, params, (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0 ? results[0].id : null);
            });
        });
      

    const obtenerDatosRelacionados = async (bloque, laboratorio) => {
        try {
            console.log(bloque);


            const idEdificio = await obtenerIdPorNombre(
                `SELECT id_edificio as id FROM edificios WHERE nombre_edificio = ?`,
                [bloque]
            );
            console.log(idEdificio);
            if (!idEdificio) {
                throw new Error(`El edificio '${bloque}' no existe`);
            }

            const idLaboratorio = await obtenerIdPorNombre(
                `SELECT id_laboratorio as id FROM laboratorios WHERE nombre_laboratorio = ?`,
                [laboratorio]
            );

            if (!idLaboratorio) {
                throw new Error(`El laboratorio '${laboratorio}' no existe`);
            }

            const checkQuery = `
        SELECT id_laboratio_edificio AS id
        FROM Edificio_Laboratorio
        WHERE id_edificio = ? AND id_laboratorio = ?
      `;
            const relacion = await obtenerIdPorNombre(checkQuery, [idEdificio, idLaboratorio]);

            let idUbicacion = relacion;
            if (!idUbicacion) {
                const insertQuery = `
          INSERT INTO Edificio_Laboratorio (id_edificio, id_laboratorio)
          VALUES (?, ?)
        `;
                idUbicacion = await new Promise((resolve, reject) => {
                    connection.query(insertQuery, [idEdificio, idLaboratorio], (err, results) => {
                        if (err) reject(err);
                        else resolve(results.insertId);
                    });
                });
            }

            return idUbicacion;
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const obtenerIdsRelacionados = async (modelo, proveedor, encargado) => {
        try {
            const idModelo = await obtenerIdPorNombre(
                `SELECT id_modelo AS id FROM modelos WHERE nombre = ?`,
                [modelo]
            );

            if (!idModelo) {
                throw new Error(`El modelo '${modelo}' no existe`);
            }

            const idProveedor = await obtenerIdPorNombre(
                `SELECT id_proveedor AS id FROM proveedores WHERE nombre = ?`,
                [proveedor]
            );

            if (!idProveedor) {
                throw new Error(`El proveedor '${proveedor}' no existe`);
            }
            const [nombre, apellido] = encargado.split(" ");
            if (!nombre || !apellido) {
                throw new Error(
                    "El valor de 'encargado' debe contener nombre y apellido separados por un espacio"
                );
            }
            const idLaboratorista = await obtenerIdPorNombre(
                `SELECT cedula AS id FROM laboratoristas WHERE nombre = ? AND apellido = ?`,
                [nombre.trim(), apellido.trim()]
            );


            if (!idLaboratorista) {
                throw new Error(`El laboratorista '${encargado}' no existe`);
            }

            return { idModelo, idProveedor, idLaboratorista };
        } catch (error) {
            throw new Error(error.message);
        }
    };
    const obtenerIdComponente = (nombreComponente) =>
        new Promise((resolve, reject) => {
            const query = "SELECT id_componente FROM componentes_internos WHERE nombre_componente = ?";
            connection.query(query, [nombreComponente.trim()], (err, results) => {
                if (err) {
                    console.error(`Error al buscar el componente '${nombreComponente}':`, err);
                    reject(err);
                } else if (results.length === 0) {
                    console.warn(`Componente no encontrado: ${nombreComponente}`);
                    resolve(null); // No encontrado
                } else {
                    resolve(results[0].id_componente);
                }
            });
        });
  
    const insertarActivo = async (activo, idUbicacion, idModelo, idProveedor, idLaboratorista) => {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO Activos (
                    numero_serie, proceso_compra, tipo, estado, 
                    id_ubicacion, id_proveedor, id_laboratorista, id_modelo, especificaciones, observaciones
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            connection.query(
                query,
                [
                    activo.numeroSerie,
                    activo.procesoCompra,
                    activo.tipoActivo,
                    activo.estado,
                    idUbicacion,
                    idProveedor,
                    idLaboratorista,
                    idModelo,
                    activo.especificaciones,
                    activo.observaciones,
                ],
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results.insertId);
                }
            );
        });
    };

    const procesarRegistros = async () => {
        const resultados = [];
    
        for (const activo of activos) {
            const connectionPromise = connection.promise();
            const componentes = activo.componentes
                ? activo.componentes.split(",").map((comp) => comp.trim())
                : [];
    
            await connectionPromise.beginTransaction(); // Iniciar la transacción
    
            try {
                // Obtener IDs relacionados para ubicación, modelo, proveedor y laboratorista
                const idUbicacion = await obtenerDatosRelacionados(activo.bloque, activo.laboratorio);
                const { idModelo, idProveedor, idLaboratorista } = await obtenerIdsRelacionados(
                    activo.modelo,
                    activo.proveedor,
                    activo.encargado
                );
    
                // Insertar activo usando el método existente
                const idActivo = await insertarActivo(
                    activo,
                    idUbicacion,
                    idModelo,
                    idProveedor,
                    idLaboratorista
                );
    
                // Insertar componentes asociados al activo (solo si tiene componentes)
                if (componentes.length > 0) {
                    await insertarComponentes(idActivo, componentes);
                }
    
                await connectionPromise.commit(); // Confirmar la transacción
                resultados.push({ success: true, activo: activo.numeroSerie });
            } catch (error) {
                await connectionPromise.rollback(); // Deshacer la transacción en caso de error
                console.error(`Error procesando activo ${activo.numeroSerie}:`, error.message);
                resultados.push({ success: false, activo: activo.numeroSerie, error: error.message });
            }
        }
    
        return resultados;
    };
    
    
    
    
      const insertarComponentes = async (idActivo, componentes) => {
        if (!componentes || componentes.length === 0) return;
    
        const values = [];
        for (const nombreComponente of componentes) {
          const idComponente = await obtenerIdComponente(nombreComponente);
          if (!idComponente) {
            throw new Error(`El componente '${nombreComponente}' no existe.`);
          }
          values.push([idActivo, idComponente]);
        }
    
        return new Promise((resolve, reject) => {
          const query = "INSERT INTO activos_componentes (id_activo, id_componente) VALUES ?";
          connection.query(query, [values], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      };
    try {
        const resultados = await procesarRegistros();
        res.status(201).json({
            message: "Registros procesados",
            resultados,
        });
    } catch (error) {
        console.error("Error procesando lote:", error);
        res.status(500).json({ error: error.message });
    }
};
