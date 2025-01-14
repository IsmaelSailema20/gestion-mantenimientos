const connection = require("../../models/db");

module.exports.obtenerMantenimientosPorMes = (req, res) => {
  const { fechaInicio, fechaFin, encargado, idEncargado,clase,tipoMantenimiento, } = req.body;

  const query = `
    SELECT 
      MONTH(dm.fecha_inicio) AS mes,
      COUNT(*) AS cantidad
    FROM detalle_mantenimiento dm
    JOIN mantenimientos m ON dm.id_mantenimiento = m.id_mantenimiento
    JOIN activos act ON act.id_activo = dm.id_activo
    JOIN modelos mdls ON mdls.id_modelo = act.id_modelo
    JOIN tipos_activo tpa ON tpa.id_tipo = mdls.id_tipo
    WHERE 
      ((? IS NOT NULL AND ? IS NOT NULL) OR YEAR(CURDATE()) = YEAR(dm.fecha_inicio)) AND -- Aplica año actual si no hay rango de fechas
       (? IS NULL OR m.tipo = ?) AND
      (? IS NULL OR tpa.id_tipo = ?) AND
      ((? IS NULL AND ? IS NULL) OR dm.fecha_inicio BETWEEN ? AND ?) AND
      (? IS NULL OR m.cedula_laboratorista = ? OR m.ruc_empresa = ?) AND
      (? IS NULL OR (? = 'Laboratorista' AND m.cedula_laboratorista IS NOT NULL) OR (? = 'Empresa' AND m.ruc_empresa IS NOT NULL))
    GROUP BY mes
    ORDER BY mes;
  `;

  // Convertir filtros vacíos a NULL
  const fechaInicioFiltro = fechaInicio === "" ? null : fechaInicio;
  const fechaFinFiltro = fechaFin === "" ? null : fechaFin;
  const encargadoFiltro = encargado === "" ? null : encargado;
  const idEncargadoFiltro = idEncargado === "" ? null : idEncargado;
  const claseFiltro = clase === "" ? null : clase;
  const tipoMantenimientoFiltro = tipoMantenimiento === "" ? null : tipoMantenimiento;

  connection.query(
    query,
    [
      fechaInicioFiltro, fechaFinFiltro, // Evalúa si ambos están presentes
      tipoMantenimientoFiltro, tipoMantenimientoFiltro, // Tipo de mantenimiento
      claseFiltro, claseFiltro, // Clase
      fechaInicioFiltro, fechaFinFiltro, fechaInicioFiltro, fechaFinFiltro, // Rango de fechas
      idEncargadoFiltro, idEncargadoFiltro, idEncargadoFiltro,
      encargadoFiltro, encargadoFiltro, encargadoFiltro,// Tipo encargado
    ],
    (err, results) => {
      if (err) {
        console.error("Error en la consulta:", err);
        return res.status(500).json({ error: "Error en la base de datos" });
      }

      res.status(200).json(results);
    }
  );
};
