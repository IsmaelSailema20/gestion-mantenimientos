const connection = require('../models/db');

module.exports.componentesSeleccionados = (req, res) => {
    const { id } = req.body
    const query = `
      SELECT 
    ci.id_componente as id,
    ci.nombre_componente as label,
    ci.descripcion as descripcion
FROM 
    historial_componentes hc
JOIN 
    componentes_internos ci ON hc.componente_interno = ci.id_componente
WHERE 
    hc.id_detalle_mantenimiento = ?;



  `;


    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error al obtener componentes del activo:", err);
            return res.status(500).json({ error: "Error al obtener componentes del activo" });
        }
        res.status(200).json(results);
    });
};
