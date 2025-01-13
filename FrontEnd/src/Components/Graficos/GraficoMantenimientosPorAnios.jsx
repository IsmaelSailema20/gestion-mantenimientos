import { Chart as ChartJS, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(...registerables, ChartDataLabels);

const GraficoMantenimientosPorAnio = async (idActivo) => {
  try {
    // Llamada al backend para obtener los datos
    const response = await fetch(
      `http://localhost:5000/mantenimientos_por_anio/${idActivo}`
    );
    const datos = await response.json();

    if (!datos || datos.length === 0) {
      console.warn("No hay datos para construir el gráfico.");
      return { hasDataTMXA: false, imageTMXA: null };
    }

    // Procesar los datos
    const anios = datos.map((d) => d.anio); // Lista de años
    const preventivos = datos.map((d) => d.cantidad_preventivo); // Datos preventivos
    const correctivos = datos.map((d) => d.cantidad_correctivo); // Datos correctivos

    // Crear un canvas en memoria
    const canvas = document.createElement("canvas");
    canvas.width = 800; // Ancho del canvas
    canvas.height = 600; // Alto del canvas
    const ctx = canvas.getContext("2d");

    // Configuración del gráfico
    const chart = new ChartJS(ctx, {
      type: "bar", // Gráfico de barras
      data: {
        labels: anios, // Años como etiquetas
        datasets: [
          {
            label: "Preventivo",
            data: preventivos,
            backgroundColor: "rgba(75, 192, 192, 0.7)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
          {
            label: "Correctivo",
            data: correctivos,
            backgroundColor: "rgba(255, 99, 132, 0.7)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: {
            position: "top",
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
            beginAtZero: true,
            ticks: {
              stepSize: 1, // Asegura divisiones claras
            },
          },
        },
      },
    });

    // Esperar que el gráfico termine de renderizarse
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generar la imagen Base64 del gráfico
    const imageTMXA = canvas.toDataURL("image/png");

    // Destruir el gráfico para liberar memoria
    chart.destroy();

    return { hasDataTMXA: true, imageTMXA };
  } catch (error) {
    console.error("Error al generar el gráfico:", error);
    return { hasDataTMXA: false, imageTMXA: null };
  }
};

export default GraficoMantenimientosPorAnio;
