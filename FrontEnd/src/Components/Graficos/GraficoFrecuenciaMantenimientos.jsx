import { Chart as ChartJS, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(...registerables, ChartDataLabels);

const GenerarGraficoFrecuencia = async (idActivo) => {
  try {
    // Obtener los datos desde la API
    const response = await fetch(
      `http://localhost:5000/frecuencia_mantenimientos/${idActivo}`
    );
    const datos = await response.json();

    // Control para datos vacíos
    if (!datos || datos.length === 0) {
      return { hasData: false, image: null }; // Retornar un indicador de datos vacíos
    }

    // Crear un canvas en memoria
    const canvas = document.createElement("canvas");
    canvas.width = 800; // Asegúrate de que estas dimensiones coincidan
    canvas.height = 300; // con las dimensiones del PDF
    const ctx = canvas.getContext("2d");

    // Configuración del gráfico
    const chart = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: datos.map((d) => d.anio),
        datasets: [
          {
            label: "Frecuencia de Mantenimientos",
            data: datos.map((d) => d.cantidad),
            backgroundColor: "rgba(54, 123, 235, 0.6)",
            borderColor: "rgb(99, 54, 235)",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: {
            display: true,
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
              text: "Año",
            },
            ticks: {
              padding: 6,
            },
          },
          y: {
            title: {
              display: true,
              text: "Cantidad de Mantenimientos",
            },
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });

    // Esperar que el gráfico termine de renderizarse
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generar la imagen Base64
    const image = canvas.toDataURL("image/png");

    // Destruir el gráfico
    chart.destroy();

    return { hasData: true, image }; // Indicar que hay datos y pasar la imagen
  } catch (error) {
    console.error("Error al generar el gráfico:", error);
    return { hasData: false, image: null };
  }
};

export default GenerarGraficoFrecuencia;
