const connection = require('../models/db');

module.exports.getActivos = (req, res) => {
    const query = `
    SELECT 
	a.id_activo,
    a.proceso_compra,
	m.id_tipo,
    a.numero_serie,
    ta.nombre AS nombre_activo,
    a.tipo AS tipo_activo,
    a.estado,
    DATE_FORMAT(a.fecha_registro, '%Y-%m-%d') AS fecha_registro,
    CONCAT(e.nombre_edificio, '/', l.nombre_laboratorio) AS ubicacion,
    a.id_proveedor, 
    prov.nombre,
    el.id_laboratorio,
    el.id_edificio AS id_ubicacion,
    a.id_modelo,
    m.nombre,
	m.id_marca,
    marc.nombre as nombre_marca,
    a.id_laboratorista,
    CONCAT(lbrt.apellido,' ', lbrt.nombre) AS laboratorista,
    a.especificaciones,
    a.observaciones
FROM 
    Activos a
JOIN 
    Edificio_Laboratorio el ON a.id_ubicacion = el.id_laboratio_edificio
JOIN 
    Edificios e ON el.id_edificio = e.id_edificio
JOIN 
    Laboratorios l ON el.id_laboratorio = l.id_laboratorio
JOIN 
    modelos m ON a.id_modelo = m.id_modelo
JOIN 
    tipos_activo ta ON m.id_tipo = ta.id_tipo
JOIN 
	proveedores prov ON a.id_proveedor = prov.id_proveedor
JOIN 
	marcas marc ON m.id_marca = marc.id_marca
JOIN 
	laboratoristas lbrt ON a.id_laboratorista = lbrt.cedula
ORDER BY 
    a.id_activo DESC;		
    `;

    try {
        connection.query(query, (err, results) => {
            if (err) {
                console.error("Error en la consulta:", err);
                return res.status(500).json({ error: "Error en la base de datos" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};
