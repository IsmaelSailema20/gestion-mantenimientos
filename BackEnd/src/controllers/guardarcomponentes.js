const connection = require('../models/db');

module.exports.guardarcomponentes = (req, res) => {
  const { idActivo, idMantenimiento, nuevosComponentes } = req.body;

  if (!idActivo || !idMantenimiento || !nuevosComponentes) {
    return res.status(400).json({
      error: "Se requieren los IDs de los activos, el ID del mantenimiento y los componentes nuevos.",
    });
  }

  console.log(nuevosComponentes);

  const queryDetalleMantenimiento = `
    SELECT id_detalle_mantenimiento
    FROM detalle_mantenimiento
    WHERE id_mantenimiento = ? AND id_activo = ?`;

  connection.query(
    queryDetalleMantenimiento,
    [idMantenimiento, idActivo],
    (error, results) => {
      if (error) {
        console.error("Error al obtener detalle de mantenimiento:", error);
        return res.status(500).json({ error: "Error al obtener detalle de mantenimiento." });
      }

      if (results.length === 0) {
        return res.status(404).json({
          error: "No se encontró detalle de mantenimiento para el activo proporcionado.",
        });
      }

      const idDetalleMantenimiento = results[0].id_detalle_mantenimiento;

      // Consultar componentes ya existentes en historial_componentes
      const historialQuery = `
        SELECT componente_interno
        FROM historial_componentes
        WHERE id_detalle_mantenimiento = ?`;

      connection.query(historialQuery, [idDetalleMantenimiento], (error, historialResults) => {
        if (error) {
          console.error("Error al consultar historial_componentes:", error);
          return res.status(500).json({ error: "Error al consultar historial de componentes." });
        }

        // Obtener los componentes existentes y realizar comparaciones
        const existentes = historialResults.map((row) => row.componente_interno);
        const componentesFiltrados = nuevosComponentes.filter(
          (componente) => !existentes.includes(componente.id)
        );
        const componentesEliminar = existentes.filter(
          (componente) => !nuevosComponentes.some((nuevo) => nuevo.id === componente)
        );

        // Paso 1: Eliminar componentes no deseados
        const deletePromise = new Promise((resolve, reject) => {
          if (componentesEliminar.length > 0) {
            const queryEliminarComponentes = `
              DELETE FROM historial_componentes
              WHERE id_detalle_mantenimiento = ? AND componente_interno IN (?)`;

            connection.query(queryEliminarComponentes, [idDetalleMantenimiento, componentesEliminar], (err) => {
              if (err) {
                console.error("Error al eliminar componentes:", err);
                return reject(err);
              }
              resolve();
            });
          } else {
            resolve();
          }
        });

        // Paso 2: Insertar nuevos componentes
        const insertPromise = new Promise((resolve, reject) => {
          if (componentesFiltrados.length > 0) {
            const componentesData = componentesFiltrados.map((componente) => [
              idDetalleMantenimiento, componente.id,
            ]);

            const insertHistorialQuery = `
              INSERT INTO historial_componentes (id_detalle_mantenimiento, componente_interno)
              VALUES ?`;

            connection.query(insertHistorialQuery, [componentesData], (err) => {
              if (err) {
                console.error("Error al insertar en historial_componentes:", err);
                return reject(err);
              }
              resolve();
            });
          } else {
            resolve();
          }
        });

        // Paso 3: Actualizar activos_componentes
        const updateActivosPromise = new Promise((resolve, reject) => {
          const activosComponentesData = nuevosComponentes.map((componente) => [
            idActivo, componente.id,
          ]);

          const deleteQuery = `
            DELETE FROM activos_componentes
            WHERE id_activo = ?`;

          connection.query(deleteQuery, [idActivo], (err) => {
            if (err) {
              console.error("Error al eliminar componentes antiguos:", err);
              return reject(err);
            }

            const insertActivosComponentesQuery = `
              INSERT INTO activos_componentes (id_activo, id_componente)
              VALUES ?`;

            connection.query(insertActivosComponentesQuery, [activosComponentesData], (err) => {
              if (err) {
                console.error("Error al insertar en activos_componentes:", err);
                return reject(err);
              }
              resolve();
            });
          });
        });

        // Ejecutar todas las promesas
        Promise.all([deletePromise, insertPromise, updateActivosPromise])
          .then(() => {
            res.status(200).json({ message: "Componentes actualizados exitosamente." });
          })
          .catch((error) => {
            console.error("Error en la actualización de componentes:", error);
            res.status(500).json({ error: "Error al actualizar los componentes." });
          });
      });
    }
  );
};
