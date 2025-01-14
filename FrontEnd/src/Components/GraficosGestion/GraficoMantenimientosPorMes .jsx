import { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";

const GraficoMantenimientosPorMes = ({ selectedFilters, chartRef }) => {
  const lineRef = useRef();
  const [chartData, setChartData] = useState(null);
  useEffect(() => {
    if (chartRef) {
      chartRef.current = {
        toBase64Image: () => lineRef.current?.toBase64Image(),
      };
    }
  }, [chartRef]);
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/obtenerMantenimientosPorMes",
          selectedFilters
        );

        const data = response.data;

        const meses = [
          "Ene",
          "Feb",
          "Mar",
          "Abr",
          "May",
          "Jun",
          "Jul",
          "Ago",
          "Sep",
          "Oct",
          "Nov",
          "Dic",
        ];

        setChartData({
          labels: meses,
          datasets: [
            {
              label: "Cantidad de Mantenimientos",
              data: meses.map((mes, index) => {
                const match = data.find((d) => d.mes === index + 1);
                return match ? match.cantidad : 0;
              }),
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 2,
              fill: true,
            },
          ],
        });
      } catch (error) {
        console.error("Error al cargar los datos del gráfico:", error);
      }
    };

    fetchChartData();
  }, [selectedFilters]);
  if (!chartData) return <p>Cargando gráfico...</p>;

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <Line
        ref={lineRef}
        data={chartData}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: "top",
            },
            title: {
              display: true,
              text: `Mantenimientos por Mes (${
                selectedFilters.fechaInicio
                  ? new Date(selectedFilters.fechaInicio).getFullYear()
                  : new Date().getFullYear()
              })`,
            },
            datalabels: {
              display: false, // Mostrar etiquetas
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Meses",
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

export default GraficoMantenimientosPorMes;
