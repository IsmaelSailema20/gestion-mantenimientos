const connection = require('../models/db');

module.exports.guardarActivos = (req, res) => {
    const { activos, idMantenimiento } = req.body;

    if (!activos || !idMantenimiento) {
        return res.status(400).json({ error: "Se requieren los IDs de los activos y el ID del mantenimiento." });
    }

    const detalleQueries = activos.map(() => "(?, ?, 'en proceso', NOW())").join(',');
    const queryDetalle = `
        INSERT INTO detalle_mantenimiento (id_mantenimiento, id_activo, estado_mantenimiento, fecha_inicio)
        VALUES ${detalleQueries}
    `;

    const queryValues = activos.flatMap(idActivo => [idMantenimiento, idActivo]);

    connection.query(queryDetalle, queryValues, (err, results) => {
        if (err) {
            console.error("Error al guardar los activos:", err);
            return res.status(500).json({ error: "Error al guardar los activos." });
        }

        res.status(200).json({ message: "Activos guardados con éxito", results });
    });
};
