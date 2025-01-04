const connection = require("../models/db");

module.exports.getComponentes = (req, res) => {
  const query = `
    SELECT id_componente, nombre_componente, descripcion
    FROM componentes_internos
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener los componentes:", err);
      return res.status(500).json({ error: "Error al obtener los componentes" });
    }

    // Buscar el componente "No definido" en los resultados
    const opcionNoDefinido = results.find((row) =>
      row.nombre_componente.toLowerCase().includes("no definido")
    );

    // Si no existe en la base de datos, retornamos un error
    if (!opcionNoDefinido) {
      console.error("No se encontró el componente 'No definido' en la base de datos");
      return res.status(500).json({ error: "El componente 'No definido' no existe en la base de datos" });
    }

    // Clasificar los componentes basados en palabras clave
    const categorias = {
      procesadores: [],
      ram: [],
      discos: [],
      graficas: [],
      fuentes: [],
      tarjetasMadre: [],
    };

    results.forEach((row) => {
      const nombre = row.nombre_componente.toLowerCase();

      if (nombre.includes("procesador")) {
        categorias.procesadores.push({
          id: row.id_componente,
          label: row.nombre_componente,
          descripcion: row.descripcion,
        });
      } else if (nombre.includes("ram")) {
        categorias.ram.push({
          id: row.id_componente,
          label: row.nombre_componente,
          descripcion: row.descripcion,
        });
      } else if (
        nombre.includes("disco") ||
        nombre.includes("hdd") ||
        nombre.includes("ssd") ||
        nombre.includes("sólido") ||
        nombre.includes("duro")
      ) {
        categorias.discos.push({
          id: row.id_componente,
          label: row.nombre_componente,
          descripcion: row.descripcion,
        });
      } else if (nombre.includes("gráfica")) {
        categorias.graficas.push({
          id: row.id_componente,
          label: row.nombre_componente,
          descripcion: row.descripcion,
        });
      } else if (nombre.includes("fuente")) {
        categorias.fuentes.push({
          id: row.id_componente,
          label: row.nombre_componente,
          descripcion: row.descripcion,
        });
      } else if (nombre.includes("madre")) {
        categorias.tarjetasMadre.push({
          id: row.id_componente,
          label: row.nombre_componente,
          descripcion: row.descripcion,
        });
      }
    });

    // Agregar la opción "No definido" a todas las categorías
    const noDefinido = {
      id: opcionNoDefinido.id_componente,
      label: opcionNoDefinido.nombre_componente,
      descripcion: opcionNoDefinido.descripcion,
    };

    Object.keys(categorias).forEach((categoria) => {
      categorias[categoria].unshift(noDefinido);
    });

    res.status(200).json(categorias);
  });
};