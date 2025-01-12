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
            const promises = idActividad.map((actividad) => {
                return new Promise((resolve, reject) => {
                    const queryInsertarActividad = `
                        INSERT INTO actividades_mantenimiento (id_detalle_mantenimiento, tipo_actividad )
                        VALUES (?, ?)
                    `;
                    connection.query(
                        queryInsertarActividad,
                        [idDetalleMantenimiento, actividad.id],
                        (err, results) => {
                            if (err) {
                                console.error("Error al insertar actividad:", err);
                                return reject(err);
                            }
                            resolve(results);
                        }
                    );
                });
            });
            Promise.all(promises)
                .then(() => {
                    connection.commit((err) => {
                        if (err) {
                            console.error("Error al confirmar transacción:", err);
                            return res.status(500).json({ error: "Error al confirmar la transacción." });
                        }
                        res.status(200).json({ message: "Las actividades se agregaron con éxito al activo." });
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
