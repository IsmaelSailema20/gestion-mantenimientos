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
        WHERE id_detalle_mantenimiento = ? AND componente_interno IN (?)`;

      const componentesIds = nuevosComponentes.map((componente) => componente.id);

      connection.query(historialQuery, [idDetalleMantenimiento, componentesIds], (error, historialResults) => {
        if (error) {
          console.error("Error al consultar historial_componentes:", error);
          return res.status(500).json({ error: "Error al consultar historial de componentes." });
        }

        // Filtrar componentes que no están en el historial
        const existentes = historialResults.map((row) => row.componente_interno);
        const componentesFiltrados = nuevosComponentes.filter(
          (componente) => !existentes.includes(componente.id)
        );

        if (componentesFiltrados.length === 0) {
          console.log("Todos los componentes ya están registrados en el historial.");
          return res.status(200).json({ error: "Todos los componentes ya están registrados en el historial." });
        }

        const componentesData = componentesFiltrados.map((componente) => [
          idDetalleMantenimiento, componente.id,
        ]);

        console.log(componentesData);

        // Eliminar componentes antiguos de la tabla activos_componentes
        const deleteQuery = `
          DELETE FROM activos_componentes
          WHERE id_activo = ?`;

        connection.query(deleteQuery, [idActivo], (error) => {
          if (error) {
            console.error("Error al eliminar componentes antiguos:", error);
            return res.status(500).json({ error: "Error al eliminar componentes antiguos del activo." });
          }

          // Inserción en historial_componentes
          const insertHistorialQuery = `
            INSERT INTO historial_componentes (id_detalle_mantenimiento, componente_interno)
            VALUES ?`;

          connection.query(insertHistorialQuery, [componentesData], (error) => {
            if (error) {
              console.error("Error al insertar en historial_componentes:", error);
              return res.status(500).json({ error: "Error al guardar en historial de componentes." });
            }

            // Construir los datos para activos_componentes
            const activosComponentesData = componentesFiltrados.map((componente) => [
              idActivo,
              componente.id,
            ]);

            const insertActivosComponentesQuery = `
              INSERT INTO activos_componentes (id_activo, id_componente)
              VALUES ?`;

            connection.query(insertActivosComponentesQuery, [activosComponentesData], (error) => {
              if (error) {
                console.error("Error al insertar en activos_componentes:", error);
                return res.status(500).json({ error: "Error al guardar componentes en el activo." });
              }

              res.status(200).json({ message: "Componentes actualizados exitosamente." });
            });
          });
        });
      });
    }
  );
};
