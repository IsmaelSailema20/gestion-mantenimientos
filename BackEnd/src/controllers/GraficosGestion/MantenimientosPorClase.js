const connection = require("../../models/db");

module.exports.obtenerMantenimientosPorClase = (req, res) => {
  const { fechaInicio, fechaFin, tipoMantenimiento, encargado, idEncargado,clase,actividad } = req.body;

  const query = `
    SELECT 
      YEAR(dm.fecha_inicio) AS anio,
      tpa.nombre AS clase_activo,
      COUNT(*) AS cantidad
    FROM detalle_mantenimiento dm
    JOIN actividades_mantenimiento am ON dm.id_detalle_mantenimiento = am.id_detalle_mantenimiento
    JOIN catalogoactividades cact ON am.tipo_actividad = cact.id
    JOIN mantenimientos m ON dm.id_mantenimiento = m.id_mantenimiento
    JOIN activos act ON act.id_activo = dm.id_activo
    JOIN modelos mdls ON mdls.id_modelo = act.id_modelo
    JOIN tipos_activo tpa ON tpa.id_tipo = mdls.id_tipo
    WHERE 
      (? IS NULL OR m.tipo = ?) AND
       (? IS NULL OR tpa.id_tipo = ?) AND
        (? IS NULL OR am.tipo_actividad = ?) AND
      ((? IS NULL AND ? IS NULL) OR dm.fecha_inicio BETWEEN ? AND ?) AND
      (? IS NULL OR m.cedula_laboratorista = ? OR m.ruc_empresa = ?) AND
      (? IS NULL OR (? = 'Laboratorista' AND m.cedula_laboratorista IS NOT NULL) OR (? = 'Empresa' AND m.ruc_empresa IS NOT NULL))
    GROUP BY anio, clase_activo
    ORDER BY anio;
  `;

  const tipoMantenimientoFiltro = tipoMantenimiento === "" ? null : tipoMantenimiento;
  const fechaInicioFiltro = fechaInicio === "" ? null : fechaInicio;
  const fechaFinFiltro = fechaFin === "" ? null : fechaFin;
  const encargadoFiltro = encargado === "" ? null : encargado;
  const idEncargadoFiltro = idEncargado === "" ? null : idEncargado;
  const claseFiltro = clase === "" ? null : clase;
  const actividadFiltro = actividad === "" ? null : actividad;

  connection.query(
    query,
    [
      tipoMantenimientoFiltro, tipoMantenimientoFiltro,
      claseFiltro, claseFiltro,
      actividadFiltro, actividadFiltro,
      fechaInicioFiltro, fechaFinFiltro, fechaInicioFiltro, fechaFinFiltro,
      idEncargadoFiltro, idEncargadoFiltro, idEncargadoFiltro,
      encargadoFiltro, encargadoFiltro, encargadoFiltro,
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
