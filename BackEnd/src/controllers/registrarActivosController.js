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
    if (!nombreActivo || !modelo || !marca || !tipoActivo || !numeroSerie ||!procesoCompra ||! especificaciones ||!observaciones || !estado || !proveedor || !ubicacion ||!encargado) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Construir la consulta SQL
    const query = `
        INSERT INTO Activos (
          numero_serie, nombre, modelo, marca, proceso_compra, tipo, estado, 
          id_ubicacion, id_proveedor, especificaciones, observaciones, id_laboratorista
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    `;

    // Ejecutar la consulta
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
