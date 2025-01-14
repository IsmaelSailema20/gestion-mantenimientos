import React from "react";
import PropTypes from "prop-types";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import encabezado from "/encabezadoPDF.png";
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 12,
    lineHeight: 1.5,
    color: "#333",
  },
  header: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#2F4F4F",
  },
  subheader: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#4682B4",
  },
  filters: {
    marginBottom: 20,
    padding: 10,
    border: "1px solid #ddd",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  filterText: {
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: "1px solid #ddd",
  },
  chartImage: {
    width: "100%",
    height: "300px",
    marginVertical: 10,
    border: "1px solid #ddd",
    borderRadius: 5,
  },
  footer: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 20,
    color: "#888",
  },
});

const GenerarReporteGestion = ({ chartImages, appliedFilters }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={encabezado} />
        <Text style={styles.header}>Reporte de Gestión</Text>
        <View style={styles.filters}>
          <Text style={styles.subheader}>Filtros Aplicados:</Text>
          <Text style={styles.filterText}>
            <Text style={{ fontWeight: "bold" }}>Actividad: </Text>
            {appliedFilters.actividad}
          </Text>
          <Text style={styles.filterText}>
            <Text style={{ fontWeight: "bold" }}>Fecha Inicio: </Text>
            {appliedFilters.fechaInicio}
          </Text>
          <Text style={styles.filterText}>
            <Text style={{ fontWeight: "bold" }}>Fecha Fin: </Text>
            {appliedFilters.fechaFin}
          </Text>
          <Text style={styles.filterText}>
            <Text style={{ fontWeight: "bold" }}>Encargado: </Text>
            {appliedFilters.encargado}
          </Text>
          <Text style={styles.filterText}>
            <Text style={{ fontWeight: "bold" }}>Tipo de Encargado: </Text>
            {appliedFilters.idEncargado}
          </Text>
          <Text style={styles.filterText}>
            <Text style={{ fontWeight: "bold" }}>Tipo de Mantenimiento: </Text>
            {appliedFilters.tipoMantenimiento}
          </Text>
          <Text style={styles.filterText}>
            <Text style={{ fontWeight: "bold" }}>Clase de Activo: </Text>
            {appliedFilters.clase}
          </Text>
        </View>

        {chartImages.map((chart, index) => (
          <View style={styles.section} key={index}>
            <Text style={styles.subheader}>{chart.title}</Text>
            <Image src={chart.image} style={styles.chartImage} />
          </View>
        ))}

        <Text style={styles.footer}>
          Generado automáticamente por el sistema de gestión.
        </Text>
      </Page>
    </Document>
  );
};

// Validar las propiedades con propTypes
GenerarReporteGestion.propTypes = {
  chartImages: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
    })
  ).isRequired,
  appliedFilters: PropTypes.shape({
    actividad: PropTypes.string,
    mes: PropTypes.string,
    fechaInicio: PropTypes.string,
    fechaFin: PropTypes.string,
    encargado: PropTypes.string,
    tipoMantenimiento: PropTypes.string,
    clase: PropTypes.string,
    idEncargado: PropTypes.string,
  }).isRequired,
};

export default GenerarReporteGestion;
