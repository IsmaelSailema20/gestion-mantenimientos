const connection = require("../../models/db");

module.exports.obtenerActividadesMantenimiento = (req, res) => {
  const { fechaInicio, fechaFin, encargado, tipoEncargado,actividad,clase,tipoMantenimiento} = req.body;

  const query = `

 SELECT 
      act.nombre AS actividad,
      COUNT(*) AS cantidad
    FROM detalle_mantenimiento dm
    JOIN actividades_mantenimiento am ON dm.id_detalle_mantenimiento = am.id_detalle_mantenimiento
    JOIN catalogoactividades act ON am.tipo_actividad = act.id
    JOIN mantenimientos m ON dm.id_mantenimiento = m.id_mantenimiento
    JOIN activos actv ON actv.id_activo = dm.id_activo
    JOIN modelos mdls ON mdls.id_modelo = actv.id_modelo
    JOIN tipos_activo tpa ON tpa.id_tipo = mdls.id_tipo
    WHERE 
    (? IS NULL OR tpa.id_tipo = ?) AND
      (? IS NULL OR m.tipo = ?) AND
        (? IS NULL OR am.tipo_actividad = ?) AND
      ((? IS NULL AND ? IS NULL) OR dm.fecha_inicio BETWEEN ? AND ?) AND
      (? IS NULL OR (? = 'Laboratorista' AND m.cedula_laboratorista IS NOT NULL) OR (? = 'Empresa' AND m.ruc_empresa IS NOT NULL))
    GROUP BY actividad
    ORDER BY cantidad DESC;
  
  `;

  // Convertir filtros vacíos a NULL
  const fechaInicioFiltro = fechaInicio === "" ? null : fechaInicio;
  const fechaFinFiltro = fechaFin === "" ? null : fechaFin;
  const tipoEncargadoFiltro = tipoEncargado === "" ? null : tipoEncargado;
  const encargadoFiltro = encargado === "" ? null : encargado;
  const actividadFiltro = actividad === "" ? null : actividad;
  const claseFiltro = clase === "" ? null : clase;
  const tipoMantenimientoFiltro = tipoMantenimiento === "" ? null : tipoMantenimiento;
  connection.query(
    query,
    [
        claseFiltro, claseFiltro,
        tipoMantenimientoFiltro, tipoMantenimientoFiltro,   
        actividadFiltro, actividadFiltro,
      fechaInicioFiltro, fechaFinFiltro, fechaInicioFiltro, fechaFinFiltro,
      tipoEncargadoFiltro, tipoEncargadoFiltro, encargadoFiltro,
      tipoEncargadoFiltro, encargadoFiltro,
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
