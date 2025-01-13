const connection = require('../models/db');

module.exports.eliminarActivoDeMantenimiento = (req, res) => {
    const { id } = req.body;
    const id_detalle = id.detalle_mantenimiento;

    // Consultas para eliminar en orden las dependencias
    const deleteActividadesMantenimiento = `
        DELETE FROM actividades_mantenimiento WHERE id_detalle_mantenimiento = ?;
    `;
    const deleteComponentesInternos = `
        DELETE FROM historial_componentes WHERE id_detalle_mantenimiento = ?;
    `;
    const deleteDetalleMantenimiento = `
        DELETE FROM detalle_mantenimiento WHERE id_detalle_mantenimiento = ?;
    `;

    // Ejecutar las consultas en orden usando una transacción
    connection.beginTransaction((err) => {
        if (err) {
            console.error("Error al iniciar la transacción", err);
            return res.status(500).json({ error: "Error al iniciar la transacción" });
        }

        // Paso 1: Eliminar en actividades_mantenimiento
        connection.query(deleteActividadesMantenimiento, [id_detalle], (err) => {
            if (err) {
                return connection.rollback(() => {
                    console.error("Error al eliminar en actividades_mantenimiento", err);
                    return res.status(500).json({ error: "Error al eliminar en actividades_mantenimiento" });
                });
            }

            // Paso 2: Eliminar en componentes_internos
            connection.query(deleteComponentesInternos, [id_detalle], (err) => {
                if (err) {
                    return connection.rollback(() => {
                        console.error("Error al eliminar en componentes_internos", err);
                        return res.status(500).json({ error: "Error al eliminar en componentes_internos" });
                    });
                }

                // Paso 3: Eliminar en detalle_mantenimiento
                connection.query(deleteDetalleMantenimiento, [id_detalle], (err) => {
                    if (err) {
                        return connection.rollback(() => {
                            console.error("Error al eliminar en detalle_mantenimiento", err);
                            return res.status(500).json({ error: "Error al eliminar en detalle_mantenimiento" });
                        });
                    }

                    // Confirmar la transacción
                    connection.commit((err) => {
                        if (err) {
                            return connection.rollback(() => {
                                console.error("Error al confirmar la transacción", err);
                                return res.status(500).json({ error: "Error al confirmar la transacción" });
                            });
                        }
                        res.status(200).json("Éxito");
                    });
                });
            });
        });
    });
};
