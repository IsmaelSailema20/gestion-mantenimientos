const connection = require('../models/db'); // Conexión a la base de datos
module.exports.crearMantenimiento = (req, res) => {
  const { tipo, descripcion, identificador, activos } = req.body;

  const queryAutoIncrement = `SHOW TABLE STATUS LIKE 'mantenimientos'`;
  connection.query(queryAutoIncrement, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener el siguiente ID' });
    }

    const nextId = rows[0].Auto_increment; // Próximo ID para la inserción
    const codigoMantenimiento = `MNT_${new Date().getFullYear()}_${nextId.toString().padStart(3, '0')}`;

    // Verificar primero en la tabla de laboratoristas
    const queryVerificarLaboratorista = `
      SELECT * FROM laboratoristas WHERE cedula = ?
    `;

    connection.query(queryVerificarLaboratorista, [identificador], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error al verificar identificador' });
      }

      if (results.length > 0) {
        // Si es un laboratorista
        const queryMantenimiento = `
          INSERT INTO mantenimientos (codigo_mantenimiento, tipo, fecha_inicio, observaciones, cedula_laboratorista) 
          VALUES (?, ?, NOW(), ?, ?)
        `;

        connection.query(queryMantenimiento, [codigoMantenimiento, tipo, descripcion, identificador], (err, result) => {
          if (err) return res.status(500).json({ error: 'Error al crear mantenimiento' });

          const idMantenimiento = result.insertId;
          const detalleQueries = activos.map(
            (idActivo) => `(${idMantenimiento}, ${idActivo}, 'en proceso', NOW())`
          ).join(',');

          const queryDetalle = `
            INSERT INTO detalle_mantenimiento (id_mantenimiento, id_activo, estado_mantenimiento, fecha_inicio)
            VALUES ${detalleQueries}
          `;

          connection.query(queryDetalle, (err) => {
            if (err) return res.status(500).json({ error: 'Error al registrar detalle' });
            res.status(200).json({ message: 'Mantenimiento creado con éxito', codigoMantenimiento });
          });
        });
      } else {
        // Verificar en la tabla de empresas_mantenimientos si no es un laboratorista
        const queryVerificarEmpresa = `
          SELECT * FROM empresas_mantenimientos WHERE ruc = ?
        `;

        connection.query(queryVerificarEmpresa, [identificador], (err, results) => {
          if (err) {
            return res.status(500).json({ error: 'Error al verificar identificador' });
          }

          if (results.length > 0) {
            // Si es una empresa
            const queryMantenimiento = `
              INSERT INTO mantenimientos (codigo_mantenimiento, tipo, fecha_inicio, observaciones, ruc_empresa) 
              VALUES (?, ?, NOW(), ?, ?)
            `;

            connection.query(queryMantenimiento, [codigoMantenimiento, tipo, descripcion, identificador], (err, result) => {
              if (err) return res.status(500).json({ error: 'Error al crear mantenimiento' });

              const idMantenimiento = result.insertId;
              const detalleQueries = activos.map(
                (idActivo) => `(${idMantenimiento}, ${idActivo}, 'en proceso', NOW())`
              ).join(',');

              const queryDetalle = `
                INSERT INTO detalle_mantenimiento (id_mantenimiento, id_activo, estado_mantenimiento, fecha_inicio)
                VALUES ${detalleQueries}
              `;

              connection.query(queryDetalle, (err) => {
                if (err) return res.status(500).json({ error: 'Error al registrar detalle' });
                res.status(200).json({ message: 'Mantenimiento creado con éxito', codigoMantenimiento });
              });
            });
          } else {
            return res.status(400).json({ error: 'Encargado o empresa no encontrado' });
          }
        });
      }
    });
  });
};
