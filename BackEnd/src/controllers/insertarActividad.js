const connection = require('../models/db');

module.exports.insertarActividad = (req, res) => {
    const { idActivos, idActividad, idMantenimiento } = req.body;

    if (!idActivos || !Array.isArray(idActivos) || idActivos.length === 0 || !idActividad) {
        return res.status(400).json({ error: "Se requieren los IDs de los activos y el ID de la actividad." });
    }

    // Consulta para obtener el id_detalle_mantenimiento desde la tabla detalle_mantenimiento
    const queryDetalleMantenimiento = `
        SELECT id_detalle_mantenimiento
        FROM detalle_mantenimiento
        WHERE id_activo IN (?) AND id_mantenimiento = ?
    `;

    // Usar una transacción para garantizar consistencia
    connection.beginTransaction((err) => {
        if (err) {
            console.error("Error al iniciar transacción:", err);
            return res.status(500).json({ error: "Error al iniciar la transacción." });
        }

        // Paso 1: Obtener los id_detalle_mantenimiento
        connection.query(queryDetalleMantenimiento, [idActivos, idMantenimiento], (err, results) => {
            if (err) {
                console.error("Error al obtener id_detalle_mantenimiento:", err);
                return connection.rollback(() => {
                    res.status(500).json({ error: "Error al obtener el detalle del mantenimiento." });
                });
            }

            if (results.length === 0) {
                return connection.rollback(() => {
                    res.status(400).json({ error: "No se encontraron detalles de mantenimiento para los activos y el mantenimiento especificado." });
                });
            }

            // Paso 2: Insertar las actividades para cada id_detalle_mantenimiento
            const promises = results.map((detalle) => {
                return new Promise((resolve, reject) => {
                    const queryInsertarActividad = `
                        INSERT INTO actividades_mantenimiento (id_detalle_mantenimiento, tipo_actividad)
                        VALUES (?, ?)
                    `;
                    connection.query(queryInsertarActividad, [detalle.id_detalle_mantenimiento, idActividad], (err, results) => {
                        if (err) {
                            console.error("Error al insertar actividad:", err);
                            return reject(err);
                        }
                        resolve(results);
                    });
                });
            });

            // Paso 3: Confirmar la transacción
            Promise.all(promises)
                .then(() => {
                    connection.commit((err) => {
                        if (err) {
                            console.error("Error al confirmar transacción:", err);
                            return res.status(500).json({ error: "Error al confirmar la transacción." });
                        }
                        res.status(200).json({ message: "Las actividades se agregaron con éxito a los activos." });
                    });
                })
                .catch((error) => {
                    connection.rollback(() => {
                        console.error("Error en la transacción, se realizó un rollback:", error);
                        res.status(500).json({ error: "Error al agregar las actividades, se realizó un rollback." });
                    });
                });
        });
    });
};
