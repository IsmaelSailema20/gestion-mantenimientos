import { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import axios from "axios";

ChartJS.register(...registerables);

const GraficoMantenimientos = ({ selectedFilters, chartRef }) => {
  const barRef = useRef();
  const [chartData, setChartData] = useState(null);
  console.log("selectedFilters", selectedFilters);
  useEffect(() => {
    if (chartRef) {
      chartRef.current = {
        toBase64Image: () => barRef.current?.toBase64Image(),
      };
    }
  }, [chartRef]);
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/obtenerMantenimientosPorFiltros",
          selectedFilters
        );

        const data = response.data;

        // Procesar datos agrupados por año
        const anios = [...new Set(data.map((item) => item.anio))];
        const tiposMantenimiento = [
          ...new Set(data.map((item) => item.tipo_mantenimiento)),
        ];

        const datasets = tiposMantenimiento.map((tipo) => ({
          label: tipo,
          data: anios.map((anio) => {
            const total = data
              .filter((d) => d.tipo_mantenimiento === tipo && d.anio === anio)
              .reduce((sum, d) => sum + d.cantidad, 0);
            return total;
          }),
          backgroundColor:
            tipo === "preventivo"
              ? "rgba(54, 162, 235, 0.6)"
              : "rgba(255, 99, 132, 0.6)",
          borderColor:
            tipo === "preventivo"
              ? "rgba(54, 162, 235, 1)"
              : "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        }));

        setChartData({
          labels: anios,
          datasets,
        });
      } catch (error) {
        console.error("Error al cargar los datos del gráfico:", error);
      }
    };

    fetchChartData();
  }, [selectedFilters]);

  if (!chartData) return <p>No hay datos disponibles</p>;

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <Bar
        ref={barRef}
        data={chartData}
        options={{
          indexAxis: "y", // Cambiar el eje para que sea horizontal
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
            datalabels: {
              display: false, // Mostrar etiquetas
            },
            title: {
              display: true,
              text: "Mantenimientos por Año y Tipo (Horizontal)",
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Cantidad de Mantenimientos",
              },
              ticks: {
                stepSize: 1,
              },
              beginAtZero: true,
            },
            y: {
              title: {
                display: true,
                text: "Año",
              },
            },
          },
        }}
      />
    </div>
  );
};

export default GraficoMantenimientos;
