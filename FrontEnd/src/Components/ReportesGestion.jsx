import { useEffect, useRef, useState } from "react";
import {
  TextField,
  MenuItem,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import GraficoMantenimientos from "../Components/GraficosGestion/GraficoMantenimientos";
import axios from "axios";
import GraficoMantenimientosPorMes from "./GraficosGestion/GraficoMantenimientosPorMes ";
import GraficoMantenimientosPorClase from "./GraficosGestion/GraficoMantenimientosPorClase";
import GraficoMantenimientosPorEncargado from "./GraficosGestion/GraficoMantenimientosPorEncargado";
import GraficoActividades from "./GraficosGestion/GraficoActividades";
import ClearIcon from "@mui/icons-material/Clear";
import { pdf } from "@react-pdf/renderer";
import GenerarReporteGestion from "./GenerarReporteGestion";
function ReportesGestion() {
  const [filters, setFilters] = useState({
    activities: [],

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
    idEncargado: "",
    tipoMantenimiento: "",
    clase: "",
  });

  const [loading, setLoading] = useState(true);
  const claseRef = useRef();
  const mesRef = useRef();
  const encargadoRef = useRef();
  const actividadesRef = useRef();
  const tipoMantRef = useRef();
  const getFilterValue = (id, list, key = "id", label = "nombre") => {
    const match = list.find((item) => item[key] === id);
    return match ? match[label] : "No seleccionado";
  };
  const handleGenerarPDF = async () => {
    const appliedFiltersTransformed = {
      actividad: getFilterValue(
        selectedFilters.actividad,
        filters.activities,
        "id",
        "nombre"
      ),
      mes: selectedFilters.mes
        ? months.find((month) => month.id === selectedFilters.mes)?.name
        : "No seleccionado",
      fechaInicio: selectedFilters.fechaInicio || "No seleccionado",
      fechaFin: selectedFilters.fechaFin || "No seleccionado",
      encargado: selectedFilters.encargado || "No seleccionado",
      idEncargado: getFilterValue(
        selectedFilters.idEncargado,
        filteredEncargados,
        "id",
        "nombre"
      ),
      tipoMantenimiento: selectedFilters.tipoMantenimiento || "No seleccionado",
      clase: getFilterValue(
        selectedFilters.clase,
        filters.clases,
        "id",
        "nombre"
      ),
    };
    const chartImages = [
      {
        title: "Mantenimientos por Clase",
        image: claseRef.current.toBase64Image(),
      },
      {
        title: "Mantenimientos por Mes",
        image: mesRef.current.toBase64Image(),
      },
      {
        title: "Mantenimientos por Encargado",
        image: encargadoRef.current.toBase64Image(),
      },
      {
        title: "Actividades Involucradas",
        image: actividadesRef.current.toBase64Image(),
      },
      {
        title: "Cantidad de Mantenimientos por Tipo",
        image: tipoMantRef.current.toBase64Image(),
      },
    ];

    const blob = await pdf(
      <GenerarReporteGestion
        chartImages={chartImages}
        appliedFilters={appliedFiltersTransformed}
      />
    ).toBlob();

    // Descargar PDF
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reporte_gestion.pdf";
    link.click();
  };

  // Fetch inicial para obtener datos del backend
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoading(true);
        // Obtener actividades
        const responseActivities = await axios.get(
          "http://localhost:5000/actividades"
        );
        setFilters((prevFilters) => ({
          ...prevFilters,
          activities: responseActivities.data || [],
        }));

        // Obtener tipos de mantenimiento
        const responseMantenimientos = await axios.get(
          "http://localhost:5000/tiposMantenimientos"
        );
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
  const fetchEncargados = async (idEncargado) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/encargados?tipo=${idEncargado}`
      );
      setFilteredEncargados(response.data || []);
    } catch (error) {
      console.error("Error al obtener los encargados filtrados:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedFilters((prev) => ({ ...prev, [name]: value }));

    if (name === "encargado") {
      fetchEncargados(value); // Filtrar encargados específicos según el tipo
    }
  };

  if (loading) {
    return (
      <Typography variant="h6" align="center">
        Cargando...
      </Typography>
    );
  }
  const handleLimpiarFiltros = () => {
    // Restablecer los filtros seleccionados a su estado inicial
    setSelectedFilters({
      actividad: "",
      mes: "",
      fechaInicio: "",
      fechaFin: "",
      encargado: "",
      idEncargado: "",
      tipoMantenimiento: "",
      clase: "",
    });

    // Restablecer los encargados filtrados
    setFilteredEncargados([]);
  };

  return (
    <>
      <div style={{ padding: "20px" }}>
        <Typography variant="h4" align="center" gutterBottom>
          Reportes de Gestión
        </Typography>
        <div className="container">
          <div className="row mb-3">
            {/* Filtro de Actividad */}
            <div className="col-md-3 mb-3">
              <TextField
                fullWidth
                select
                label="Seleccione una Actividad"
                name="actividad"
                value={selectedFilters.actividad}
                onChange={handleChange}
                InputProps={{
                  endAdornment: selectedFilters.actividad && (
                    <InputAdornment
                      position="end"
                      style={{ marginRight: "10px" }}
                    >
                      <IconButton
                        onClick={() =>
                          setSelectedFilters((prev) => ({
                            ...prev,
                            actividad: "",
                          }))
                        }
                        edge="end"
                        sx={{
                          backgroundColor: "red", // Fondo rojo
                          color: "white", // Color del ícono
                          "&:hover": {
                            backgroundColor: "darkred", // Fondo al pasar el mouse
                          },
                          borderRadius: "50%", // Forma redonda
                          padding: "2px", // Espaciado interno
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              >
                {filters.activities.map((activity) => (
                  <MenuItem key={activity.id} value={activity.id}>
                    {activity.nombre}
                  </MenuItem>
                )) || (
                  <MenuItem disabled>No hay actividades disponibles</MenuItem>
                )}
              </TextField>
            </div>

            {/* Fecha - Inicio */}
            <div className="col-md-3 mb-3">
              <TextField
                fullWidth
                label="Fecha - Inicio"
                type="date"
                name="fechaInicio"
                value={selectedFilters.fechaInicio}
                onChange={(e) =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    fechaInicio: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
              />
            </div>
            {/* Fecha - Fin */}
            <div className="col-md-3 mb-3">
              <TextField
                fullWidth
                label="Fecha - Fin"
                type="date"
                name="fechaFin"
                value={selectedFilters.fechaFin}
                onChange={(e) =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    fechaFin: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                fullWidth
                select
                label="Seleccione una Clase"
                name="clase"
                value={selectedFilters.clase}
                onChange={handleChange}
                InputProps={{
                  endAdornment: selectedFilters.clase && (
                    <InputAdornment
                      position="end"
                      style={{ marginRight: "10px" }}
                    >
                      <IconButton
                        onClick={() =>
                          setSelectedFilters((prev) => ({
                            ...prev,
                            clase: "",
                          }))
                        }
                        edge="end"
                        sx={{
                          backgroundColor: "red", // Fondo rojo
                          color: "white", // Color del ícono
                          "&:hover": {
                            backgroundColor: "darkred", // Fondo al pasar el mouse
                          },
                          borderRadius: "50%", // Forma redonda
                          padding: "2px", // Espaciado interno
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              >
                {filters.clases.map((clase) => (
                  <MenuItem key={clase.id} value={clase.id}>
                    {clase.nombre}
                  </MenuItem>
                )) || <MenuItem disabled>No hay clases disponibles</MenuItem>}
              </TextField>
            </div>
          </div>
          <div className="row mb-3">
            {/* Filtro de Encargado */}
            <div className="col-md-3 mb-3">
              <TextField
                fullWidth
                select
                label="Seleccione un Tipo de Encargado"
                name="encargado"
                value={selectedFilters.encargado}
                onChange={handleChange}
                InputProps={{
                  endAdornment: selectedFilters.encargado && (
                    <InputAdornment
                      position="end"
                      style={{ marginRight: "10px" }}
                    >
                      <IconButton
                        onClick={() =>
                          setSelectedFilters((prev) => ({
                            ...prev,
                            encargado: "",
                          }))
                        }
                        edge="end"
                        sx={{
                          backgroundColor: "red", // Fondo rojo
                          color: "white", // Color del ícono
                          "&:hover": {
                            backgroundColor: "darkred", // Fondo al pasar el mouse
                          },
                          borderRadius: "50%", // Forma redonda
                          padding: "2px", // Espaciado interno
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              >
                {filters.encargados.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>
                    {tipo}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            {/* Combo dinámico dependiente de encargado */}
            <div className="col-md-3 mb-3">
              <TextField
                fullWidth
                select
                label="Seleccione un Encargado"
                name="idEncargado"
                value={selectedFilters.idEncargado}
                onChange={handleChange}
                disabled={filteredEncargados.length === 0}
                InputProps={{
                  endAdornment: selectedFilters.idEncargado && (
                    <InputAdornment
                      position="end"
                      style={{ marginRight: "10px" }}
                    >
                      <IconButton
                        onClick={() =>
                          setSelectedFilters((prev) => ({
                            ...prev,
                            idEncargado: "",
                          }))
                        }
                        edge="end"
                        sx={{
                          backgroundColor: "red", // Fondo rojo
                          color: "white", // Color del ícono
                          "&:hover": {
                            backgroundColor: "darkred", // Fondo al pasar el mouse
                          },
                          borderRadius: "50%", // Forma redonda
                          padding: "2px", // Espaciado interno
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              >
                {filteredEncargados.map((encargado) => (
                  <MenuItem key={encargado.id} value={encargado.id}>
                    {encargado.nombre}
                  </MenuItem>
                )) || (
                  <MenuItem disabled>No hay encargados disponibles</MenuItem>
                )}
              </TextField>
            </div>
            {/* Tipo de Mantenimiento */}
            <div className="col-md-3 mb-3">
              <TextField
                fullWidth
                select
                label="Tipo de Mantenimiento"
                name="tipoMantenimiento"
                value={selectedFilters.tipoMantenimiento}
                onChange={handleChange}
                InputProps={{
                  endAdornment: selectedFilters.tipoMantenimiento && (
                    <InputAdornment
                      position="end"
                      style={{ marginRight: "10px" }}
                    >
                      <IconButton
                        onClick={() =>
                          setSelectedFilters((prev) => ({
                            ...prev,
                            tipoMantenimiento: "",
                          }))
                        }
                        edge="end"
                        sx={{
                          backgroundColor: "red", // Fondo rojo
                          color: "white", // Color del ícono
                          "&:hover": {
                            backgroundColor: "darkred", // Fondo al pasar el mouse
                          },
                          borderRadius: "50%", // Forma redonda
                          padding: "2px", // Espaciado interno
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              >
                {filters.tiposMantenimiento.map((tipoMantenimiento) => (
                  <MenuItem
                    key={tipoMantenimiento.tipo}
                    value={tipoMantenimiento.tipo}
                  >
                    {tipoMantenimiento.tipo}
                  </MenuItem>
                )) || (
                  <MenuItem disabled>
                    No hay tipos de mantenimiento disponibles
                  </MenuItem>
                )}
              </TextField>
            </div>
            <div className="col-md-3 mb-3">
              <button
                type="button"
                onClick={handleLimpiarFiltros}
                className="btn btn-danger w-100 h-100"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 mb-3">
              <button
                type="button"
                onClick={handleGenerarPDF}
                className="btn btn-primary w-100 h-100"
              >
                Generar Reporte
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Contenedor del gráfico */}
      <div className="row mt-2" style={{ paddingLeft: "-40px" }}>
        {/* Primer gráfico */}
        <div className="col-md-12 mb-1">
          <GraficoMantenimientosPorClase
            selectedFilters={selectedFilters}
            chartRef={claseRef}
          />
        </div>

        {/* Segundo gráfico */}
        <div className="col-md-6 mb-1">
          <GraficoMantenimientosPorMes
            selectedFilters={selectedFilters}
            chartRef={mesRef}
          />
        </div>

        <div className="col-md-6 mb-1">
          <GraficoMantenimientosPorEncargado
            selectedFilters={selectedFilters}
            chartRef={encargadoRef}
          />
        </div>
        <div className="col-md-6 mb-1">
          <GraficoMantenimientos
            selectedFilters={selectedFilters}
            chartRef={tipoMantRef}
          />
        </div>
        <div className="col-md-6 mb-1">
          <GraficoActividades
            selectedFilters={selectedFilters}
            chartRef={actividadesRef}
          />
        </div>
      </div>
    </>
  );
}

export default ReportesGestion;
