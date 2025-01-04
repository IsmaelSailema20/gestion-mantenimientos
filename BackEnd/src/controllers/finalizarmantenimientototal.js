const connection = require('../models/db');

module.exports.finalizarmantenimientototal = (req, res) => {
    const { idActivos, id } = req.body;

    if (!idActivos || !Array.isArray(idActivos) || idActivos.length === 0 || !id) {
        return res.status(400).json({ error: "Se requieren los IDs de los activos  y el ID del mantenimiento."+ idActivos+" "+id});
    }

    const queryDetalle = `
        UPDATE detalle_mantenimiento 
        SET estado_mantenimiento = 'finalizado', 
            fecha_fin = NOW() 
        WHERE id_activo IN (?) AND id_mantenimiento = ?`;
    
    connection.query(queryDetalle, [idActivos, id], (err, results) => {
        if (err) {
            console.error("Error al finalizar el mantenimiento de los activos:", err);
            return res.status(500).json({ error: "Error al finalizar el mantenimiento de los activos." });
        }

        res.status(200).json({ 
            message: "Se finalizaron los mantenimientos de los activos con éxito.", 
            results 
        });
    });
};
