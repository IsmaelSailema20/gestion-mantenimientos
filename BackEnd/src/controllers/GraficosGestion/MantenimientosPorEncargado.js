const connection = require("../../models/db");

module.exports.obtenerMantenimientosPorEncargado = (req, res) => {
  const { fechaInicio, fechaFin, encargado, tipoEncargado,tipoMantenimiento, clase} = req.body;

  const query = `
    SELECT 
      YEAR(dm.fecha_inicio) AS anio,
      CASE
        WHEN m.cedula_laboratorista IS NOT NULL THEN 'Laboratorista'
        WHEN m.ruc_empresa IS NOT NULL THEN 'Empresa'
      END AS tipo_encargado,
      COUNT(*) AS cantidad
    FROM detalle_mantenimiento dm
    JOIN mantenimientos m ON dm.id_mantenimiento = m.id_mantenimiento
    JOIN activos actv ON actv.id_activo = dm.id_activo
    JOIN modelos mdls ON mdls.id_modelo = actv.id_modelo
    JOIN tipos_activo tpa ON tpa.id_tipo = mdls.id_tipo
    WHERE 
    (? IS NULL OR tpa.id_tipo = ?) AND
      ((? IS NULL AND ? IS NULL) OR dm.fecha_inicio BETWEEN ? AND ?) AND
       (? IS NULL OR m.tipo = ?) AND
      (? IS NULL OR (? = 'Laboratorista' AND m.cedula_laboratorista = ?) OR (? = 'Empresa' AND m.ruc_empresa = ?))
    GROUP BY anio, tipo_encargado
    ORDER BY anio;
  `;

  // Convertir filtros vacíos a NULL
  const fechaInicioFiltro = fechaInicio === "" ? null : fechaInicio;
  const fechaFinFiltro = fechaFin === "" ? null : fechaFin;
  const tipoEncargadoFiltro = tipoEncargado === "" ? null : tipoEncargado;
  const encargadoFiltro = encargado === "" ? null : encargado;
  const tipoMantenimientoFiltro = tipoMantenimiento === "" ? null : tipoMantenimiento;
  const claseFiltro = clase === "" ? null : clase;
  connection.query(
    query,
    [
        claseFiltro, claseFiltro,
      fechaInicioFiltro, fechaFinFiltro, fechaInicioFiltro, fechaFinFiltro,
        tipoMantenimientoFiltro, tipoMantenimientoFiltro,
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
