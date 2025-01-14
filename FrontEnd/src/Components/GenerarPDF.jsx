import PropTypes from "prop-types";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  pdf,
  Image,
} from "@react-pdf/renderer";
import { useEffect, useState } from "react";
import axios from "axios";
import encabezado from "/encabezadoPDF.png";
import GenerarGraficoFrecuencia from "./Graficos/GraficoFrecuenciaMantenimientos";
import GraficoTiposMantenimientosMes from "./Graficos/GraficoTiposMantenimientosMes";
import GraficoMantenimientosPorAnio from "./Graficos/GraficoMantenimientosPorAnios";
import GraficoMantenimientosEmpresaLaboratorista from "./Graficos/GraficoMantenimientosEmpresaLaboratorista";
const GenerarPDF = ({ activo }) => {
  const [componentes, setComponentes] = useState([]);
  const [chartData, setChartData] = useState({ hasData: false, image: null });
  const [proporcionChart, setProporcionChart] = useState({
    hasDataGTM: false,
    imageGTM: null,
  });
  const [tipoMantXAnio, setTipoMantXAnio] = useState({
    hasDataTMXA: false,
    imageTMXA: null,
  });

  const [mantXEmpresaLaboratorista, setMantXEmpresaLaboratorista] = useState({
    hasDataMLE: false,
    imageMLE: null,
  });
  const [currentYear, setCurrentYear] = useState("");

  useEffect(() => {
    const year = new Date().getFullYear(); // Obtiene el año actual
    setCurrentYear(year);
  }, []);
  // Obtener componentes internos y gráfico
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener componentes internos
        const response = await axios.get(
          `http://localhost:5000/componentes/${activo.id_activo}`
        );
        setComponentes(response.data);

        // Ejecutar ambas operaciones de gráficos en paralelo
        const [
          frecuenciaChart,
          proporcionChartData,
          tipoMantXAnio,
          mantXEmpresaLaboratorista,
        ] = await Promise.all([
          GenerarGraficoFrecuencia(activo.id_activo), // Gráfico de barras
          GraficoTiposMantenimientosMes(activo.id_activo), // Gráfico de pastel
          GraficoMantenimientosPorAnio(activo.id_activo), // Gráfico de barras
          GraficoMantenimientosEmpresaLaboratorista(activo.id_activo), // Gráfico de barras
        ]);

        // Actualizar estados de los gráficos
        setChartData(frecuenciaChart);
        setProporcionChart(proporcionChartData);
        setTipoMantXAnio(tipoMantXAnio);
        setMantXEmpresaLaboratorista(mantXEmpresaLaboratorista);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, [activo.id_activo]);

  // Función para generar el PDF
  const generatePDF = async () => {
    const MyDocument = () => (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Encabezado */}
          <Image src={encabezado} />
          {/* Título del documento */}
          <View style={styles.header}>
            <Text style={styles.title}>Hoja de vida Activo</Text>
          </View>
          {/* Información del Activo */}
          <View style={styles.activoSection}>
            <Text style={styles.sectionTitle}>Detalles del Activo</Text>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Nombre:</Text>
              <Text style={styles.value}>{activo.nombre_activo}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Número de Serie:</Text>
              <Text style={styles.value}>{activo.numero_serie}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Tipo:</Text>
              <Text style={styles.value}>{activo.tipo_activo}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Estado:</Text>
              <Text style={styles.value}>{activo.estado}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Fecha de Registro:</Text>
              <Text style={styles.value}>{activo.fecha_registro}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Ubicación:</Text>
              <Text style={styles.value}>{activo.ubicacion}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>
                Laboratorista Encargado Del Registro:
              </Text>
              <Text style={styles.value}>{activo.laboratorista}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Marca:</Text>
              <Text style={styles.value}>{activo.nombre_marca}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Observaciones:</Text>
              <Text style={styles.value}>{activo.observaciones || "N/A"}</Text>
            </View>
          </View>
          {/* Componentes Internos o Especificaciones */}
          {activo.nombre_activo === "CPU" ? (
            <View style={styles.componentesSection}>
              <Text style={styles.sectionTitle}>Componentes Internos</Text>
              {componentes.length > 0 ? (
                componentes.map((componente, index) => (
                  <View key={index} style={styles.componenteRow}>
                    <Text style={styles.componenteText}>
                      {componente.nombre_componente}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noComponentes}>
                  Sin componentes internos
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Especificaciones:</Text>
              <Text style={styles.value}>
                {activo.especificaciones || "N/A"}
              </Text>
            </View>
          )}
          {/* Gráfico o mensaje */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>
              Frecuencia de Mantenimientos
            </Text>
            <Text style={styles.textDescripcion}>
              Este gráfico muestra la cantidad de mantenimientos realizados en
              el activo {activo.numero_serie}, esta cantidad esta organizada por
              año, lo que permite visualizar patrones de mantenimientos,
              identificar años con mayor o menor actividad y evaluar la
              periodicidad del mantenimiento del activo.
            </Text>
            {chartData.hasData ? (
              <Image src={chartData.image} style={styles.chartImage} />
            ) : (
              <Text style={styles.noDataMessage}>
                No hay datos disponibles para mostrar la frecuencia de
                mantenimientos.
              </Text>
            )}
          </View>
          {/* Gráfico de Proporción de Mantenimientos */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>
              Cantidad de Mantenimientos ({currentYear})
            </Text>
            <Text style={styles.textDescripcion}>
              Este gráfico muestra la cantidad total de mantenimientos
              realizados en los distintos meses del año actual({currentYear}).
              Cada barra representa un mes específico y su longitud refleja el
              número de mantenimientos llevados a cabo en ese período.
            </Text>
            {proporcionChart.hasDataGTM ? (
              <Image
                src={proporcionChart.imageGTM}
                style={styles.proporcionChart}
              />
            ) : (
              <Text style={styles.noDataMessage}>
                No hay datos disponibles para los mantenimientos en el año
                actual.
              </Text>
            )}
          </View>
          {/* Gráfico de tipo Mantenimientos x anio */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>
              Tipos De Mantenimientos Por Año
            </Text>
            <Text style={styles.textDescripcion}>
              El siguiente gráfico muestra la cantidad de mantenimientos
              realizados en cada año, separados por tipo de mantenimiento:
              preventivo y correctivo. Este gráfico permite visualizar de manera
              clara y comparativa cómo se distribuyen los diferentes tipos de
              mantenimiento a lo largo del tiempo.
            </Text>
            {tipoMantXAnio.hasDataTMXA ? (
              <Image
                src={tipoMantXAnio.imageTMXA}
                style={styles.tipoMantXAnio}
              />
            ) : (
              <Text style={styles.noDataMessage}>
                No hay datos disponibles para mostrar el historial de los tipos
                de mantenimientos.
              </Text>
            )}
          </View>
          {/* Gráfico de tipo Mantenimientos x laboratorista y empresa x anio */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>
              Mantenimientos Dados Empresas/Laboratoristas Por Año
            </Text>
            <Text style={styles.textDescripcion}>
              El siguiente gráfico presenta la comparación de los mantenimientos
              realizados por empresas y laboratoristas a lo largo de los años.
              Este gráfico permite analizar cómo se distribuyen las
              responsabilidades de mantenimiento entre estas dos categorías y
              detectar tendencias a lo largo del tiempo.
            </Text>
            {mantXEmpresaLaboratorista.hasDataMLE ? (
              <Image
                src={mantXEmpresaLaboratorista.imageMLE}
                style={styles.mantXEmpLab}
              />
            ) : (
              <Text style={styles.noDataMessage}>
                No hay datos disponibles para el historial de los mantenimientos
                dados por los laboratoristas o empresas
              </Text>
            )}
          </View>
        </Page>
      </Document>
    );

    const blob = await pdf(<MyDocument />).toBlob();

    // Descargar el PDF
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reporte_activo.pdf";
    link.click();
  };

  return (
    <button
      onClick={generatePDF}
      className="d-flex flex-column align-items-center justify-content-center"
      style={{
        backgroundColor: "transparent",
        border: "none",
        padding: 0,
        width: "100%",
      }}
    >
      <img
        src="/reportes.png"
        alt="Reportes"
        style={{ width: "44px", height: "34px" }}
      />
      <span style={{ fontSize: "14px", marginTop: "5px" }}>Informes</span>
    </button>
  );
};

/*const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Helvetica" },
  header: { marginBottom: 20, textAlign: "center" },
  title: { fontSize: 16, fontWeight: "bold", color: "#2c3e50" },
  activoSection: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#34495e",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 5,
    fontSize: 12,
  },
  textDescripcion: {
    fontSize: 11,
    color: "#000000",
    marginBottom: 10,
    textAlign: "left",
  },
  label: { width: "40%", fontWeight: "bold", color: "#2c3e50" },
  value: { width: "60%", color: "#7f8c8d" },
  componentesSection: { marginBottom: 20 },
  componenteRow: { marginBottom: 5 },
  componenteText: { fontSize: 12, color: "#7f8c8d" },
  noComponentes: { fontSize: 12, color: "#e74c3c" },
  chartSection: { marginTop: 20, textAlign: "center" },
  chartImage: { width: "100%", height: 300, marginTop: 0, padding: 0 },
  proporcionChart: { width: "100%", height: 300, marginTop: 0, padding: 0 },
  tipoMantXAnio: { width: "100%", height: 300, marginTop: 0, padding: 0 },
  mantXEmpLab: { width: "100%", height: 300, marginTop: 0, padding: 0 },
  noDataMessage: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#d9534f",
    textAlign: "center",
    marginTop: 20,
  },
});*/
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 12,
    lineHeight: 1.5,
    color: "#2c3e50",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#34495e",
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "uppercase",
    color: "#2c3e50",
    borderBottom: "1px solid #ddd",
    paddingBottom: 5,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 5,
    fontSize: 12,
  },
  label: {
    width: "45%",
    fontWeight: "bold",
    color: "#34495e",
  },
  value: {
    width: "65%",
    color: "#7f8c8d",
  },
  textDescripcion: {
    fontSize: 11,
    marginBottom: 10,
    textAlign: "justify",
  },
  chartSection: {
    marginTop: 20,
    textAlign: "center",
    border: "1px solid #ddd",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  chartImage: {
    width: "100%",
    height: 300,
    marginTop: 10,
  },
  noDataMessage: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#e74c3c",
    textAlign: "center",
    marginTop: 20,
  },
  footer: {
    marginTop: 20,
    fontSize: 10,
    textAlign: "center",
    color: "#95a5a6",
  },
});
GenerarPDF.propTypes = {
  activo: PropTypes.shape({
    id_activo: PropTypes.number.isRequired,
    numero_serie: PropTypes.string.isRequired,
    nombre_activo: PropTypes.string.isRequired,
    tipo_activo: PropTypes.string.isRequired,
    estado: PropTypes.string.isRequired,
    fecha_registro: PropTypes.string.isRequired,
    ubicacion: PropTypes.string.isRequired,
    laboratorista: PropTypes.string.isRequired,
    nombre_marca: PropTypes.string.isRequired,
    especificaciones: PropTypes.string,
    observaciones: PropTypes.string,
  }).isRequired,
};

export default GenerarPDF;
