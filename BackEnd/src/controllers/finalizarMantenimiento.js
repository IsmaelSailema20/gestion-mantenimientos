const connection = require('../models/db');

module.exports.finalizarMantenimiento = (req, res) => {
    const { idActivo, id } = req.body;

    if (!idActivo || !id) {
        return res.status(400).json({ error: "Se requieren los IDs de los activos y el ID del mantenimiento." });
    }

    const queryDetalle = `
       UPDATE detalle_mantenimiento 
SET estado_mantenimiento = 'finalizado', 
    fecha_fin = NOW() where id_activo= ? and id_mantenimiento= ?  `;


    connection.query(queryDetalle, [idActivo, id], (err, results) => {
        if (err) {
            console.error("Error al finalizar el  mantenimiento:", err);
            return res.status(500).json({ error: "Error al finalizar el  mantenimiento." });
        }

        res.status(200).json({ message: "Se finalizo el mantenimiento", results });
    });
};
