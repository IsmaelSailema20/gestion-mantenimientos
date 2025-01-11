const connection = require('../models/db'); // Conexión a la base de datos

module.exports.crearMantenimiento = (req, res) => {
  const { tipo, descripcion, identificador, activos,fecha } = req.body;

  // Verificar primero en la tabla de laboratoristas
  const queryVerificarLaboratorista = `
    SELECT * FROM laboratoristas WHERE cedula = ?
  `;

  connection.query(queryVerificarLaboratorista, [identificador], (err, results) => {
    if (err) {
      console.error('Error al verificar identificador en laboratoristas:', err);
      return res.status(500).json({ error: 'Error al verificar identificador en laboratoristas', details: err.message });
    }

    if (results.length > 0) {
      // Si es un laboratorista
      const queryMantenimiento = `
        INSERT INTO mantenimientos (tipo, fecha_inicio, observaciones, cedula_laboratorista) 
        VALUES (?, ?, ?, ?)
      `;

      connection.query(queryMantenimiento, [tipo, fecha, descripcion, identificador], (err, result) => {
        if (err) {
          console.error('Error al crear mantenimiento:', err);
          return res.status(500).json({ error: 'Error al crear mantenimiento', details: err.message });
        }

        const idMantenimiento = result.insertId;
        const codigoMantenimiento = `MNT_${new Date().getFullYear()}_${idMantenimiento.toString().padStart(3, '0')}`;

        // Actualizar el código de mantenimiento con el ID generado
        const queryActualizarCodigo = `
          UPDATE mantenimientos 
          SET codigo_mantenimiento = ? 
          WHERE id_mantenimiento = ?
        `;
        connection.query(queryActualizarCodigo, [codigoMantenimiento, idMantenimiento], (err) => {
          if (err) {
            console.error('Error al actualizar código de mantenimiento:', err);
            return res.status(500).json({ error: 'Error al actualizar código de mantenimiento', details: err.message });
          }

          const detalleQueries = activos.map(
            (idActivo) => `(${idMantenimiento}, ${idActivo}, 'en proceso', NOW())`
          ).join(',');

          const queryDetalle = `
            INSERT INTO detalle_mantenimiento (id_mantenimiento, id_activo, estado_mantenimiento, fecha_inicio)
            VALUES ${detalleQueries}
          `;

          connection.query(queryDetalle, (err) => {
            if (err) {
              console.error('Error al registrar detalle:', err);
              return res.status(500).json({ error: 'Error al registrar detalle', details: err.message });
            }
            res.status(200).json({ message: 'Mantenimiento creado con éxito', codigoMantenimiento });
          });
        });
      });
    } else {
      // Verificar en la tabla de empresas_mantenimientos si no es un laboratorista
      const queryVerificarEmpresa = `
        SELECT * FROM empresas_mantenimientos WHERE ruc = ?
      `;

      connection.query(queryVerificarEmpresa, [identificador], (err, results) => {
        if (err) {
          console.error('Error al verificar identificador en empresas_mantenimientos:', err);
          return res.status(500).json({ error: 'Error al verificar identificador en empresas_mantenimientos', details: err.message });
        }

        if (results.length > 0) {
          // Si es una empresa
          const queryMantenimiento = `
            INSERT INTO mantenimientos (tipo, fecha_inicio, observaciones, ruc_empresa) 
            VALUES (?, ?, ?, ?)
          `;

          connection.query(queryMantenimiento, [tipo, fecha,descripcion, identificador], (err, result) => {
            if (err) {
              console.error('Error al crear mantenimiento:', err);
              return res.status(500).json({ error: 'Error al crear mantenimiento', details: err.message });
            }

            const idMantenimiento = result.insertId;
            const codigoMantenimiento = `MNT_${new Date().getFullYear()}_${idMantenimiento.toString().padStart(3, '0')}`;

            // Actualizar el código de mantenimiento con el ID generado
            const queryActualizarCodigo = `
              UPDATE mantenimientos 
              SET codigo_mantenimiento = ? 
              WHERE id_mantenimiento = ?
            `;
            connection.query(queryActualizarCodigo, [codigoMantenimiento, idMantenimiento], (err) => {
              if (err) {
                console.error('Error al actualizar código de mantenimiento:', err);
                return res.status(500).json({ error: 'Error al actualizar código de mantenimiento', details: err.message });
              }

              const detalleQueries = activos.map(
                (idActivo) => `(${idMantenimiento}, ${idActivo}, 'en proceso', NOW())`
              ).join(',');

              const queryDetalle = `
                INSERT INTO detalle_mantenimiento (id_mantenimiento, id_activo, estado_mantenimiento, fecha_inicio)
                VALUES ${detalleQueries}
              `;

              connection.query(queryDetalle, (err) => {
                if (err) {
                  console.error('Error al registrar detalle:', err);
                  return res.status(500).json({ error: 'Error al registrar detalle', details: err.message });
                }
                res.status(200).json({ message: 'Mantenimiento creado con éxito', codigoMantenimiento });
              });
            });
          });
        } else {
          console.error('Encargado o empresa no encontrado');
          return res.status(400).json({ error: 'Encargado o empresa no encontrado' });
        }
      });
    }
  });
};
