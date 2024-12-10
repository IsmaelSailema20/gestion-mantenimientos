const connection = require('../models/db');

module.exports.registrarActivos = (req, res) => {
    const {
        nombreActivo,
        modelo,
        marca,
        tipoActivo,
        numeroSerie,
        procesoCompra,
        proveedor,
        ubicacion,
        estado,
        especificaciones,
        observaciones,
        encargado,
    } = req.body; // Los datos que recibes desde el frontend

    // Validar los datos antes de insertarlos
    let errors = [];
    if (!nombreActivo) errors.push({ field: 'nombreActivo', message: 'El nombre del activo es obligatorio' });
    if (!modelo) errors.push({ field: 'modelo', message: 'El modelo es obligatorio' });
    if (!marca) errors.push({ field: 'marca', message: 'La marca es obligatoria' });
    if (!tipoActivo) errors.push({ field: 'tipoActivo', message: 'El tipo de activo es obligatorio' });
    if (!numeroSerie) errors.push({ field: 'numeroSerie', message: 'El número de serie es obligatorio' });
    if (!procesoCompra) errors.push({ field: 'procesoCompra', message: 'El proceso de compra es obligatorio' });
    if (!especificaciones) errors.push({ field: 'especificaciones', message: 'Las especificaciones son obligatorias' });
    if (!observaciones) errors.push({ field: 'observaciones', message: 'Las observaciones son obligatorias' });
    if (!estado) errors.push({ field: 'estado', message: 'El estado es obligatorio' });
    if (!proveedor) errors.push({ field: 'proveedor', message: 'El proveedor es obligatorio' });
    if (!ubicacion) errors.push({ field: 'ubicacion', message: 'La ubicación es obligatoria' });
    if (!encargado) errors.push({ field: 'encargado', message: 'El encargado es obligatorio' });

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // Si todo es válido, proceder con la consulta SQL
    const query = `
        INSERT INTO Activos (
          numero_serie, nombre, modelo, marca, proceso_compra, tipo, estado, 
          id_ubicacion, id_proveedor, especificaciones, observaciones, id_laboratorista
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    `;

    connection.query(
        query,
        [
            numeroSerie,
            nombreActivo,
            modelo,
            marca,
            procesoCompra,
            tipoActivo,
            estado,
            ubicacion,   // id_ubicacion
            proveedor,   // id_proveedor
            especificaciones,
            observaciones,
            encargado,   // id_laboratorista (encargado)
        ],
        (err, results) => {
            if (err) {
                console.error("Error al guardar el activo:", err);
                return res.status(500).json({ error: "Error al guardar el activo", details: err });
            }
            res.status(201).json({ message: "Activo registrado con éxito", data: results });
        }
    );
};
