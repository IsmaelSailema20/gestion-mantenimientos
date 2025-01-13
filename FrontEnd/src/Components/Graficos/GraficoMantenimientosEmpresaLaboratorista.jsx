import { Chart as ChartJS, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(...registerables, ChartDataLabels);

const GraficoMantenimientosEmpresaLaboratorista = async (idActivo) => {
  try {
    // Llamada al backend para obtener los datos
    const response = await fetch(
      `http://localhost:5000/mantenimientos_empresa_laboratorista/${idActivo}`
    );
    const datos = await response.json();

    if (!datos || datos.length === 0) {
      console.warn("No hay datos para construir el gráfico.");
      return { hasDataMLE: false, imageMLE: null };
    }

    // Procesar los datos
    const anios = datos.map((d) => d.anio); // Lista de años
    const empresa = datos.map((d) => d.cantidad_empresa); // Mantenimientos realizados por empresa
    const laboratorista = datos.map((d) => d.cantidad_laboratorista); // Mantenimientos realizados por laboratorista

    // Crear un canvas en memoria
    const canvas = document.createElement("canvas");
    canvas.width = 800; // Ancho del canvas
    canvas.height = 600; // Alto del canvas
    const ctx = canvas.getContext("2d");

    const chart = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: anios,
        datasets: [
          {
            label: "Empresa",
            data: empresa,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 2,
            tension: 0.4,
          },
          {
            label: "Laboratorista",
            data: laboratorista,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderWidth: 2,
            tension: 0.4,
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
            beginAtZero: true,
          },
        },
      },
    });

    // Esperar que el gráfico termine de renderizarse
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generar la imagen Base64 del gráfico
    const imageMLE = canvas.toDataURL("image/png");

    // Destruir el gráfico para liberar memoria
    chart.destroy();

    return { hasDataMLE: true, imageMLE };
  } catch (error) {
    console.error("Error al generar el gráfico:", error);
    return { hasDataMLE: false, imageMLE: null };
  }
};

export default GraficoMantenimientosEmpresaLaboratorista;
