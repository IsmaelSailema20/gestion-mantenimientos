const connection = require('../models/db');

module.exports.componentesActuales = (req, res) => {
    // Asegúrate de obtener el id correctamente según el tipo de solicitud
    const { id } = req.body;  // Si es una solicitud POST
    // const { id } = req.query; // Si es una solicitud GET y el id se pasa como query parameter
    
    // Validar que el id sea un número
    if (isNaN(id)) {
        return res.status(400).json({ error: "El id debe ser un número válido"+" "+id });
    }

    const query = `
    SELECT 
        a.id_activo,
        m.nombre AS tipo_activo, 
        c.id_componente,
        c.nombre_componente,
        c.descripcion,
        tp.nombre
    FROM 
        activos AS a
    JOIN 
        modelos AS m ON a.id_modelo = m.id_modelo 
    JOIN 
        activos_componentes AS ac ON a.id_activo = ac.id_activo 
    JOIN 
        componentes_internos AS c ON ac.id_componente = c.id_componente 
    JOIN 
        tipos_activo as tp ON m.id_tipo = tp.id_tipo
    WHERE 
        a.id_activo = ? 
    ORDER BY 
        m.nombre, a.id_activo, c.id_componente;`;

    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error al obtener componentes del activo:", err);
            return res.status(500).json({ error: "Error al obtener componentes del activo" });
        }
        res.status(200).json(results);
    });
};
