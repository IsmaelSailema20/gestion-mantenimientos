const connection = require("../models/db");

module.exports.actualizarMantenimiento = (req, res) => {
    const { id } = req.params;
    const { fechaInicio, fechaFin, tipo, cedula, ruc, descripcion, estado } = req.body;
    const fechaFinSend = fechaFin || null;
    console.log(fechaInicio, fechaFin, tipo, cedula, ruc, descripcion, estado,id);
    
    console.log (fechaFin)


    console.log (fechaFinSend)
    // Consulta para actualizar mantenimientos
    const queryMantenimientos = `
      UPDATE mantenimientos
      SET fecha_inicio = ?, fecha_fin = ?, tipo = ?, cedula_laboratorista = ?, ruc_empresa = ?, observaciones = ?
      WHERE id_mantenimiento = ?
    `;
  
    const valuesMantenimientos = [fechaInicio, fechaFinSend, tipo, cedula, ruc, descripcion, id];
  
    // Actualizar mantenimientos
    connection.query(queryMantenimientos, valuesMantenimientos, (err, result) => {
      if (err) {
        console.error("Error al actualizar mantenimiento:", err);
        return res.status(500).json({ error: "Error al actualizar mantenimiento." });
      }
  
      // Consulta para actualizar detalle_mantenimiento
      const queryDetalle = `
        UPDATE detalle_mantenimiento
        SET estado_mantenimiento = ?
        WHERE id_mantenimiento = ?
      `;
  
      connection.query(queryDetalle, [estado, id], (err, result) => {
        if (err) {
          console.error("Error al actualizar detalle del mantenimiento:", err);
          return res.status(500).json({ error: "Error al actualizar detalle del mantenimiento." });
        }
  
        res.status(200).json({ message: "Mantenimiento actualizado exitosamente." });
      });
    });
  };