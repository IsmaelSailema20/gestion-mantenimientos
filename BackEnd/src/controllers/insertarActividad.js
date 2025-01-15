const connection = require('../models/db');

module.exports.insertarActividad = (req, res) => {
    const { idActivos, idMantenimiento, idActividad } = req.body;

    if (!idActivos || !idMantenimiento || !idActividad || !Array.isArray(idActividad)) {
        return res.status(400).json({
            error: "Se requieren el ID del activo, el ID del mantenimiento y una lista de actividades.",
        });
    }

    const queryDetalleMantenimiento = `
        SELECT id_detalle_mantenimiento
        FROM detalle_mantenimiento
        WHERE id_activo = ? AND id_mantenimiento = ?
    `;

    // Iniciar la transacción
    connection.beginTransaction((err) => {
        if (err) {
            console.error("Error al iniciar transacción:", err);
            return res.status(500).json({ error: "Error al iniciar la transacción." });
        }

        // Paso 1: Obtener el id_detalle_mantenimiento
        connection.query(queryDetalleMantenimiento, [idActivos, idMantenimiento], (err, results) => {
            if (err) {
                console.error("Error al obtener id_detalle_mantenimiento:", err);
                return connection.rollback(() => {
                    res.status(500).json({ error: "Error al obtener el detalle del mantenimiento." });
                });
            }

            if (results.length === 0) {
                return connection.rollback(() => {
                    res.status(400).json({
                        error: "No se encontraron detalles de mantenimiento para el activo y mantenimiento especificado.",
                    });
                });
            }

            const idDetalleMantenimiento = results[0].id_detalle_mantenimiento;

            // Paso 2: Consultar actividades existentes
            const actividadIds = idActividad.map((actividad) => actividad.id);
            const queryActividadesExistentes = `
                                    SELECT 
                            am.tipo_actividad,
                            ca.nombre as nombre
                        FROM 
                            actividades_mantenimiento am
                        JOIN 
                            catalogoactividades ca ON am.tipo_actividad = ca.id
                        WHERE 
                            am.id_detalle_mantenimiento = ? `;

            connection.query(queryActividadesExistentes, [idDetalleMantenimiento], (err, existingResults) => {
                if (err) {
                    console.error("Error al consultar actividades existentes:", err);
                    return connection.rollback(() => {
                        res.status(500).json({ error: "Error al verificar las actividades existentes." });
                    });
                }


                const existingActivityIds = new Set(existingResults.map((row) => row.tipo_actividad));
                const existingActivityNames = new Set(existingResults.map((row) => row.nombre));

                // Filtrar actividades a insertar y a eliminar
                const activitiesToInsert = idActividad.filter((actividad) => !existingActivityIds.has(actividad.id));
                const activitiesToDelete = Array.from(existingActivityIds).filter((activityId) => !actividadIds.includes(activityId));

                console.log(existingResults, "existing result");

                // Verificar si "Cambio de componentes" está en las actividades a eliminar
                const hasCambioDeComponentes = existingResults.some(
                    (row) => row.nombre === "Cambio de componentes" && activitiesToDelete.includes(row.tipo_actividad)
                );

                const deletePromise = new Promise((resolve, reject) => {
                    if (activitiesToDelete.length > 0) {
                        const queryEliminarActividades = `
                            DELETE FROM actividades_mantenimiento
                            WHERE id_detalle_mantenimiento = ? AND tipo_actividad IN (?)
                        `;
                        connection.query(queryEliminarActividades, [idDetalleMantenimiento, activitiesToDelete], (err) => {
                            if (err) {
                                console.error("Error al eliminar actividades:", err);
                                return reject(err);
                            }

                            console.log(hasCambioDeComponentes, "hay cambio de componentes");

                            // Si "Cambio de componentes" está en las actividades eliminadas
                            if (hasCambioDeComponentes) {
                                const queryEliminarHistorial = `
                                    DELETE FROM historial_componentes
                                    WHERE id_detalle_mantenimiento = ?
                                `;
                                connection.query(queryEliminarHistorial, [idDetalleMantenimiento], (err) => {
                                    if (err) {
                                        console.error("Error al eliminar historial de componentes:", err);
                                        return reject(err);
                                    }
                                    resolve();
                                });
                            } else {
                                resolve();
                            }
                        });
                    } else {
                        resolve();
                    }
                });

                // Continuar con las demás promesas e inserciones...


                // Paso 5: Insertar actividades nuevas
                const insertPromises = activitiesToInsert.map((actividad) => {
                    return new Promise((resolve, reject) => {
                        const queryInsertarActividad = `
                            INSERT INTO actividades_mantenimiento (id_detalle_mantenimiento, tipo_actividad)
                            VALUES (?, ?)
                        `;
                        connection.query(queryInsertarActividad, [idDetalleMantenimiento, actividad.id], (err) => {
                            if (err) {
                                console.error("Error al insertar actividad:", err);
                                return reject(err);
                            }
                            resolve();
                        });
                    });
                });

                Promise.all([deletePromise, ...insertPromises])
                    .then(() => {
                        connection.commit((err) => {
                            if (err) {
                                console.error("Error al confirmar transacción:", err);
                                return res.status(500).json({ error: "Error al confirmar la transacción." });
                            }
                            res.status(200).json({ message: "Las actividades se actualizaron con éxito." });
                        });
                    })
                    .catch((error) => {
                        connection.rollback(() => {
                            console.error("Error en la transacción, se realizó un rollback:", error);
                            res.status(500).json({ error: "Error al actualizar las actividades, se realizó un rollback." });
                        });
                    });
            });
        });
    });
};
