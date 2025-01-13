import React, { useEffect, useState } from "react";
import { Grid, TextField, MenuItem, Button, Typography } from "@mui/material";
import axios from "axios";

function ReportesGestion() {
  const months = [
    { id: "1", name: "Enero" },
    { id: "2", name: "Febrero" },
    { id: "3", name: "Marzo" },
    { id: "4", name: "Abril" },
    { id: "5", name: "Mayo" },
    { id: "6", name: "Junio" },
    { id: "7", name: "Julio" },
    { id: "8", name: "Agosto" },
    { id: "9", name: "Septiembre" },
    { id: "10", name: "Octubre" },
    { id: "11", name: "Noviembre" },
    { id: "12", name: "Diciembre" },
  ];

  const [filters, setFilters] = useState({
    activities: [],
    months: months,
    encargados: ["Laboratorista", "Empresa"], // Opciones precargadas para el encargados
    tiposMantenimiento: [], // Cambié el nombre a 'tiposMantenimiento'
    clases: [],
  });

  const [filteredEncargados, setFilteredEncargados] = useState([]); // Combo dependiente del encargado
  const [selectedFilters, setSelectedFilters] = useState({
    actividad: "",
    mes: "",
    fechaInicio: "",
    fechaFin: "",
    encargado: "",
    tipoEncargado: "",
    tipoMantenimiento: "", // Cambié el nombre a 'tipoMantenimiento'
    clase: "",
  });

  const [allowedDateRange, setAllowedDateRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(true);

  // Fetch inicial para obtener datos del backend
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoading(true);
        // Obtener actividades
        const responseActivities = await axios.get("http://localhost:5000/actividades");
        setFilters((prevFilters) => ({
          ...prevFilters,
          activities: responseActivities.data || [],
        }));

        // Obtener tipos de mantenimiento
        const responseMantenimientos = await axios.get("http://localhost:5000/tiposMantenimientos");
        setFilters((prevFilters) => ({
          ...prevFilters,
          tiposMantenimiento: responseMantenimientos.data || [], // Cambié el nombre aquí
        }));

        const responseClases = await axios.get("http://localhost:5000/clases");
      console.log("Clases:", responseClases.data);
      setFilters((prevFilters) => ({
        ...prevFilters,
        clases: responseClases.data || [],
      }));
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  // Fetch dinámico para obtener encargados específicos según el tipo (Laboratorista o Empresa)
  const fetchEncargados = async (tipoEncargado) => {
    try {
      const response = await axios.get(`http://localhost:5000/encargados?tipo=${tipoEncargado}`);
      setFilteredEncargados(response.data || []);
    } catch (error) {
      console.error("Error al obtener los encargados filtrados:", error);
    }
  };

  // Fetch dinámico para obtener clases basadas en el tipo de mantenimiento seleccionado
  const fetchClases = async (tipoMantenimientoId) => {
    try {
      const response = await axios.get(`http://localhost:5000/clases/${tipoMantenimientoId}`);
      setFilters((prevFilters) => ({
        ...prevFilters,
        clases: response.data || [],
      }));
    } catch (error) {
      console.error("Error al obtener las clases:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedFilters((prev) => ({ ...prev, [name]: value }));

    if (name === "mes") {
      const newDateRange = getMonthRange(value);
      setAllowedDateRange(newDateRange);

      // Reiniciar fechas seleccionadas
      setSelectedFilters((prev) => ({
        ...prev,
        fechaInicio: "",
        fechaFin: "",
      }));
    }

    if (name === "tipoMantenimiento") {
      fetchClases(value); // Filtrar clases basadas en tipo de mantenimiento
    }

    if (name === "encargado") {
      fetchEncargados(value); // Filtrar encargados específicos según el tipo
    }
  };

  const getMonthRange = (monthId) => {
    const year = new Date().getFullYear();
    const month = parseInt(monthId, 10) - 1; // El mes en JavaScript es 0-indexed
    const start = new Date(year, month, 1).toISOString().split("T")[0]; // Primer día del mes
    const end = new Date(year, month + 1, 0).toISOString().split("T")[0]; // Último día del mes
    return { start, end };
  };

  const handleSubmit = () => {
    console.log("Filtros seleccionados:", selectedFilters);
    axios
      .post("http://localhost:5000/reports", selectedFilters)
      .then((response) => {
        console.log("Reportes generados:", response.data);
      })
      .catch((error) => console.error("Error al generar el reporte:", error));
  };

  if (loading) {
    return <Typography variant="h6" align="center">Cargando...</Typography>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Reportes de Gestión
      </Typography>
      <Grid container spacing={2} alignItems="center" style={{ marginBottom: "20px" }}>
        {/* Filtro de Actividad */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            select
            label="Seleccione una Actividad"
            name="actividad"
            value={selectedFilters.actividad}
            onChange={handleChange}
          >
            {filters.activities.map((activity) => (
              <MenuItem key={activity.id} value={activity.id}>
                {activity.nombre}
              </MenuItem>
            )) || <MenuItem disabled>No hay actividades disponibles</MenuItem>}
          </TextField>
        </Grid>

        {/* Filtro de Mes */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            select
            label="Seleccione un Mes"
            name="mes"
            value={selectedFilters.mes}
            onChange={handleChange}
          >
            {filters.months.map((month) => (
              <MenuItem key={month.id} value={month.id}>
                {month.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Fecha - Inicio */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Fecha - Inicio"
            type="date"
            name="fechaInicio"
            value={selectedFilters.fechaInicio}
            onChange={(e) =>
              setSelectedFilters((prev) => ({ ...prev, fechaInicio: e.target.value }))
            }
            InputLabelProps={{ shrink: true }}
            InputProps={{
              inputProps: {
                min: allowedDateRange.start,
                max: allowedDateRange.end,
              },
            }}
            disabled={!allowedDateRange.start}
          />
        </Grid>

        {/* Fecha - Fin */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Fecha - Fin"
            type="date"
            name="fechaFin"
            value={selectedFilters.fechaFin}
            onChange={(e) =>
              setSelectedFilters((prev) => ({ ...prev, fechaFin: e.target.value }))
            }
            InputLabelProps={{ shrink: true }}
            InputProps={{
              inputProps: {
                min: allowedDateRange.start,
                max: allowedDateRange.end,
              },
            }}
            disabled={!allowedDateRange.end}
          />
        </Grid>

        {/* Filtro de Encargado */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            select
            label="Seleccione un Encargado"
            name="encargado"
            value={selectedFilters.encargado}
            onChange={handleChange}
          >
            {filters.encargados.map((tipo) => (
              <MenuItem key={tipo} value={tipo}>
                {tipo}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Combo dinámico dependiente de encargado */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            select
            label="Seleccione un Encargado Específico"
            name="tipoEncargado"
            value={selectedFilters.tipoEncargado}
            onChange={handleChange}
            disabled={filteredEncargados.length === 0}
          >
            {filteredEncargados.map((encargado) => (
              <MenuItem key={encargado.id} value={encargado.id}>
                {encargado.nombre}
              </MenuItem>
            )) || <MenuItem disabled>No hay encargados disponibles</MenuItem>}
          </TextField>
        </Grid>

        {/* Tipo de Mantenimiento */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            select
            label="Tipo de Mantenimiento"
            name="tipoMantenimiento"
            value={selectedFilters.tipoMantenimiento}
            onChange={handleChange}
          >
            {filters.tiposMantenimiento.map((tipoMantenimiento) => (
              <MenuItem key={tipoMantenimiento.id} value={tipoMantenimiento.id}>
                {tipoMantenimiento.tipo}
              </MenuItem>
            )) || <MenuItem disabled>No hay tipos de mantenimiento disponibles</MenuItem>}
          </TextField>
        </Grid>

        {/* Clase */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            select
            label="Seleccione una Clase"
            name="clase"
            value={selectedFilters.clase}
            onChange={handleChange}
          >
            {filters.clases.map((clase) => (
              <MenuItem key={clase.id} value={clase.id}>
                {clase.nombre}
              </MenuItem>
            )) || <MenuItem disabled>No hay clases disponibles</MenuItem>}
          </TextField>
        </Grid>
      </Grid>
    </div>
  );
}

export default ReportesGestion;
