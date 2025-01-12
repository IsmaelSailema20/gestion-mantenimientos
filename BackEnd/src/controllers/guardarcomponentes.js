const connection = require('../models/db');

module.exports.guardarcomponentes = (req, res) => {
  const { idActivo, idMantenimiento, nuevosComponentes } = req.body;

  if (!idActivo || !idMantenimiento || !nuevosComponentes) {
    return res.status(400).json({
      error: "Se requieren los IDs de los activos, el ID del mantenimiento y los componentes nuevos.",
    });
  }
  console.log(nuevosComponentes);
  // Consulta para obtener id_detalle_mantenimiento
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

      // Construir los datos para historial_componentes
      const componentesData = nuevosComponentes.map((componente) => [
        idDetalleMantenimiento, componente.id
      ]);
console.log(componentesData);
      if (componentesData.length === 0) {
        return res.status(400).json({ error: "No hay componentes válidos para insertar." });
      }

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
        const historialQuery = `
          INSERT INTO historial_componentes (id_detalle_mantenimiento, componente_interno)
          VALUES ?`;

        connection.query(historialQuery, [componentesData], (error) => {
          if (error) {
            console.error("Error al insertar en historial_componentes:", error);
            return res.status(500).json({ error: "Error al guardar en historial de componentes." });
          }

          // Construir los datos para activos_componentes
          const activosComponentesData = nuevosComponentes.map((componente) => [
            idActivo,
            componente.id, // Extraer solo el id
          ]);
          

          if (activosComponentesData.length === 0) {
            return res.status(400).json({ error: "No hay componentes válidos para insertar en activos." });
          }

          // Inserción en activos_componentes
          const activosComponentesQuery = `
            INSERT INTO activos_componentes (id_activo, id_componente)
            VALUES ?`;

          connection.query(activosComponentesQuery, [activosComponentesData], (error) => {
            if (error) {
              console.error("Error al insertar en activos_componentes:", error);
              return res.status(500).json({ error: "Error al guardar componentes en el activo." });
            }

            res.status(200).json({ message: "Componentes actualizados exitosamente." });
          });
        });
      });
    }
  );
};
