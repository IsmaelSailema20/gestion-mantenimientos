import { Chart as ChartJS, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(...registerables, ChartDataLabels);

const GraficoMantenimientosMensuales = async (idActivo) => {
  try {
    // Llamada al backend para obtener los datos
    const response = await fetch(
      `http://localhost:5000/tipos_mantenimientos_mes/${idActivo}` // Ajusta la URL según tu configuración
    );
    const datos = await response.json();

    if (!datos || datos.length === 0) {
      console.warn("No hay datos para construir el gráfico.");
      return { hasDataGTM: false, imageGTM: null };
    }

    // Procesar los datos
    const meses = datos.map((d) => d.mes); // Etiquetas de los meses (Enero, Febrero, etc.)
    const cantidades = datos.map((d) => d.cantidad_mantenimientos); // Cantidad total de mantenimientos

    // Crear un canvas en memoria
    const canvas = document.createElement("canvas");
    canvas.width = 500; // Ancho del canvas
    canvas.height = 300; // Alto del canvas
    const ctx = canvas.getContext("2d");

    // Configuración del gráfico
    const chart = new ChartJS(ctx, {
      type: "bar", // Gráfico de barras
      data: {
        labels: meses, // Nombres de los meses
        datasets: [
          {
            label: "Cantidad de Mantenimientos",
            data: cantidades, // Valores de los mantenimientos
            backgroundColor: "rgba(75, 141, 192, 0.7)",
            borderColor: "rgb(75, 83, 192)",
            borderWidth: 1,
            barPercentage: 0.9, // Asegura que las barras ocupen más espacio
            categoryPercentage: 0.8, // Ajusta el ancho de las barras dentro de cada categoría
          },
        ],
      },
      options: {
        responsive: false,
        indexAxis: "y", // Eje horizontal
        plugins: {
          legend: {
            display: false, // Ocultar leyenda
          },
          datalabels: {
            display: false, // Mostrar etiquetas
          },
        },

        scales: {
          x: {
            title: {
              display: true,
              text: "Cantidad de Mantenimientos",
            },
            beginAtZero: true, // Inicia desde 0
            ticks: {
              stepSize: 1, // Asegura que las divisiones sean correctas
            },
            suggestedMax: Math.max(...cantidades) + 1,
          },
          y: {
            title: {
              display: true,
              text: "Meses",
            },
            ticks: {
              align: "center", // Alinea las etiquetas de los meses
            },
            grid: {
              drawBorder: false, // Evita el doble borde
            },
          },
        },
      },
    });

    // Esperar que el gráfico termine de renderizarse
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generar la imagen Base64 del gráfico
    const imageGTM = canvas.toDataURL("image/png");

    // Destruir el gráfico para liberar memoria
    chart.destroy();

    return { hasDataGTM: true, imageGTM };
  } catch (error) {
    console.error("Error al generar el gráfico:", error);
    return { hasDataGTM: false, imageGTM: null };
  }
};

export default GraficoMantenimientosMensuales;
