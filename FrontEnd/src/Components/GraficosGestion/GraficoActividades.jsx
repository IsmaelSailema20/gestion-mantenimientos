import React, { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import axios from "axios";

ChartJS.register(...registerables);

const GraficoActividades = ({ selectedFilters, chartRef }) => {
  const barRef = useRef();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (chartRef) {
      chartRef.current = {
        toBase64Image: () => barRef.current?.toBase64Image(),
      };
    }
  }, [chartRef]);
  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:5000/obtenerActividadesMantenimiento",
          selectedFilters
        );

        const data = response.data;
        const backgroundColor = [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
          "rgba(201, 203, 207, 0.5)",
          "rgba(255, 205, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(54, 162, 235, 0.5)",
        ];

        const borderColor = [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(201, 203, 207, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(54, 162, 235, 1)",
        ];
        // Configurar los datos del gráfico
        setChartData({
          labels: data.map((item) => item.actividad),
          // Uso en el dataset
          datasets: [
            {
              label: "Cantidad de Mantenimientos",
              data: data.map((item) => item.cantidad),
              backgroundColor,
              borderColor,
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error("Error al cargar los datos del gráfico:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [selectedFilters]);

  if (loading) return <p>Cargando gráfico...</p>;

  return (
    <div style={{ width: "100%", height: "500px", margin: "0 auto" }}>
      <Bar
        ref={barRef}
        data={chartData}
        options={{
          indexAxis: "y", // Configurar barras horizontales
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            datalabels: {
              display: false, // Mostrar etiquetas
            },
            legend: {
              display: false, // Ocultar la leyenda para este gráfico
            },
            title: {
              display: true,
              text: "Actividades Involucradas en Mantenimientos",
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Cantidad de Mantenimientos",
              },
              beginAtZero: true,
              ticks: {
                stepSize: 1, // Asegura que las divisiones sean correctas
              },
            },
            y: {
              title: {
                display: true,
                text: "Actividades",
              },
              ticks: {
                autoSkip: false, // Evitar que se omitan etiquetas
              },
            },
          },
        }}
      />
    </div>
  );
};

export default GraficoActividades;
