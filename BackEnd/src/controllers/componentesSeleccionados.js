const connection = require('../models/db');

module.exports.componentesSeleccionados = (req, res) => {
    const { id } = req.body;
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

        // Agregar la categoría a cada componente
        const clasificarComponente = (nombre) => {
            const lowerNombre = nombre.toLowerCase();

            if (lowerNombre.includes("procesador")) return "procesadores";
            if (lowerNombre.includes("ram")) return "ram";
            if (
                lowerNombre.includes("disco") ||
                lowerNombre.includes("hdd") ||
                lowerNombre.includes("ssd") ||
                lowerNombre.includes("sólido") ||
                lowerNombre.includes("duro")
            )
                return "discos";
            if (lowerNombre.includes("gráfica")) return "graficas";
            if (lowerNombre.includes("fuente")) return "fuentes";
            if (lowerNombre.includes("madre")) return "tarjetasMadre";
            return "otros"; // Categoría por defecto si no coincide con ninguna
        };

        const componentesConCategoria = results.map((componente) => ({
            ...componente,
            categoria: clasificarComponente(componente.label),
        }));

        res.status(200).json(componentesConCategoria);
    });
};
