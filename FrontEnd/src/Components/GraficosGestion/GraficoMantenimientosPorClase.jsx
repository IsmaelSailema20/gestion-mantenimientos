import { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import axios from "axios";

ChartJS.register(...registerables);

const GraficoMantenimientosPorClase = ({ selectedFilters, chartRef }) => {
  const barRef = useRef();
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/obtenerMantenimientosPorClase",
          selectedFilters
        );

        const data = response.data;

        // Obtener años y clases de activos únicas
        const anios = [...new Set(data.map((item) => item.anio))];
        const clases = [...new Set(data.map((item) => item.clase_activo))];

        // Crear los datasets para las clases
        const datasets = clases.map((clase) => ({
          label: clase,
          data: anios.map((anio) => {
            const match = data.find(
              (d) => d.clase_activo === clase && d.anio === anio
            );
            return match ? match.cantidad : 0;
          }),
          backgroundColor: `rgba(${Math.floor(
            Math.random() * 255
          )}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
            Math.random() * 255
          )}, 0.6)`,
          borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
            Math.random() * 255
          )}, ${Math.floor(Math.random() * 255)}, 1)`,
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

  useEffect(() => {
    if (chartRef) {
      chartRef.current = {
        toBase64Image: () => barRef.current?.toBase64Image(),
      };
    }
  }, [chartRef]);
  if (!chartData) return <p>Cargando gráfico...</p>;

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <Bar
        ref={barRef} // Añadir referencia
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },

            title: {
              display: true,
              text: "Mantenimientos por Clase de Activos (Años)",
            },
            datalabels: {
              display: false, // Mostrar etiquetas
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Años",
              },
            },
            y: {
              title: {
                display: true,
                text: "Cantidad de Mantenimientos",
              },
              ticks: {
                stepSize: 1, // Asegura que las divisiones sean correctas
              },
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
};

export default GraficoMantenimientosPorClase;
