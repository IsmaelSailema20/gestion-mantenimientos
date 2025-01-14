import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import axios from "axios";

ChartJS.register(...registerables);

const GraficoMantenimientosPorEncargado = ({ selectedFilters, chartRef }) => {
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
          "http://localhost:5000/obtenerMantenimientosPorEncargado",
          selectedFilters
        );

        const data = response.data;

        // Obtener años únicos
        const anios = [...new Set(data.map((item) => item.anio))];

        // Crear los datasets para empresas y laboratoristas
        const datasets = [
          {
            label: "Empresas",
            data: anios.map((anio) => {
              const match = data.find(
                (d) => d.tipo_encargado === "Empresa" && d.anio === anio
              );
              return match ? match.cantidad : 0;
            }),
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            tension: 0.4, // Suavizado de la línea
            fill: true,
          },
          {
            label: "Laboratoristas",
            data: anios.map((anio) => {
              const match = data.find(
                (d) => d.tipo_encargado === "Laboratorista" && d.anio === anio
              );
              return match ? match.cantidad : 0;
            }),
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            tension: 0.4, // Suavizado de la línea
            fill: true,
          },
        ];

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

  if (!chartData) return <p>Cargando gráfico...</p>;

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <Line
        ref={lineRef}
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
              text: "Mantenimientos por Empresas y Laboratoristas (Años)",
            },
            datalabels: {
              display: true, // Mostrar etiquetas
              color: "black", // Color de las etiquetas
              font: {
                size: 12,
              },
              align: "top", // Alinear encima de los puntos
              formatter: (value) => value, // Mostrar el valor directamente
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

export default GraficoMantenimientosPorEncargado;
