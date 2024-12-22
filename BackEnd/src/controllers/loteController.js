const connection = require('../models/db');

module.exports.loteController = async (req, res) => {
    const activos = req.body;
    const obtenerIdPorNombre = (query, params) =>
        new Promise((resolve, reject) => {
            connection.query(query, params, (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0 ? results[0].id : null);
            });
        });

    const obtenerDatosRelacionados = async (bloque, laboratorio) => {
        try {
            console.log(bloque);


            const idEdificio = await obtenerIdPorNombre(
                `SELECT id_edificio as id FROM edificios WHERE nombre_edificio = ?`,
                [bloque]
            );
            console.log(idEdificio);
            if (!idEdificio) {
                throw new Error(`El edificio '${bloque}' no existe`);
            }

            const idLaboratorio = await obtenerIdPorNombre(
                `SELECT id_laboratorio as id FROM laboratorios WHERE nombre_laboratorio = ?`,
                [laboratorio]
            );

            if (!idLaboratorio) {
                throw new Error(`El laboratorio '${laboratorio}' no existe`);
            }

            const checkQuery = `
        SELECT id_laboratio_edificio AS id
        FROM Edificio_Laboratorio
        WHERE id_edificio = ? AND id_laboratorio = ?
      `;
            const relacion = await obtenerIdPorNombre(checkQuery, [idEdificio, idLaboratorio]);

            let idUbicacion = relacion;
            if (!idUbicacion) {
                const insertQuery = `
          INSERT INTO Edificio_Laboratorio (id_edificio, id_laboratorio)
          VALUES (?, ?)
        `;
                idUbicacion = await new Promise((resolve, reject) => {
                    connection.query(insertQuery, [idEdificio, idLaboratorio], (err, results) => {
                        if (err) reject(err);
                        else resolve(results.insertId);
                    });
                });
            }

            return idUbicacion;
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const obtenerIdsRelacionados = async (modelo, proveedor, encargado) => {
        try {
            const idModelo = await obtenerIdPorNombre(
                `SELECT id_modelo AS id FROM modelos WHERE nombre = ?`,
                [modelo]
            );

            if (!idModelo) {
                throw new Error(`El modelo '${modelo}' no existe`);
            }

            const idProveedor = await obtenerIdPorNombre(
                `SELECT id_proveedor AS id FROM proveedores WHERE nombre = ?`,
                [proveedor]
            );

            if (!idProveedor) {
                throw new Error(`El proveedor '${proveedor}' no existe`);
            }
            const [nombre, apellido] = encargado.split(" ");
            if (!nombre || !apellido) {
                throw new Error(
                    "El valor de 'encargado' debe contener nombre y apellido separados por un espacio"
                );
            }
            const idLaboratorista = await obtenerIdPorNombre(
                `SELECT cedula AS id FROM laboratoristas WHERE nombre = ? AND apellido = ?`,
                [nombre.trim(), apellido.trim()]
            );


            if (!idLaboratorista) {
                throw new Error(`El laboratorista '${encargado}' no existe`);
            }

            return { idModelo, idProveedor, idLaboratorista };
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const insertarActivo = async (activo, idUbicacion, idModelo, idProveedor, idLaboratorista) => {
        return new Promise((resolve, reject) => {
            const query = `
        INSERT INTO Activos (
          numero_serie, proceso_compra, tipo, estado, 
          id_ubicacion, id_proveedor, id_laboratorista, id_modelo
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
            connection.query(
                query,
                [
                    activo.numeroSerie,
                    activo.procesoCompra,
                    activo.tipoActivo,
                    activo.estado,
                    idUbicacion,
                    idProveedor,
                    idLaboratorista,
                    idModelo,
                ],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });
    };

    const procesarRegistros = async () => {
        const resultados = [];

        for (const activo of activos) {
            try {
                const idUbicacion = await obtenerDatosRelacionados(activo.bloque, activo.laboratorio);
                const { idModelo, idProveedor, idLaboratorista } = await obtenerIdsRelacionados(
                    activo.modelo,
                    activo.proveedor,
                    activo.encargado
                );

                const resultado = await insertarActivo(activo, idUbicacion, idModelo, idProveedor, idLaboratorista);
                resultados.push({ success: true, activo: activo.numeroSerie, resultado });
            } catch (error) {
                console.error(`Error procesando activo ${activo.numeroSerie}:`, error.message);
                resultados.push({ success: false, activo: activo.numeroSerie, error: error.message });
            }
        }

        return resultados;
    };

    try {
        const resultados = await procesarRegistros();
        res.status(201).json({
            message: "Registros procesados",
            resultados,
        });
    } catch (error) {
        console.error("Error procesando lote:", error);
        res.status(500).json({ error: error.message });
    }
};
