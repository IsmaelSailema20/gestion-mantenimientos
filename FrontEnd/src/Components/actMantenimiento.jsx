import React, { useEffect, useState } from "react";
import axios from "axios";

function ActividadesPorMantenimiento({ idMantenimiento }) {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("useeeeeeeeeee");  // Aquí imprimimos la respuesta

    const fetchActividades = async () => {
      try {
        const response = await axios.post("http://localhost:5000/actividadesPorMantenimiento", {
          id: idMantenimiento,
        });
        setActividades(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching actividades:", err);
        setError("Hubo un problema al obtener las actividades.");
        setLoading(false);
      }
    };

    fetchActividades();
  }, [idMantenimiento]);

  if (loading) {
    return <p>Cargando actividades...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h3>Actividades para el Mantenimiento ID: {idMantenimiento}</h3>
      <table>
        <thead>
          <tr>
            <th>Actividad</th>
            <th>Cantidad de Activos</th>
          </tr>
        </thead>
        <tbody>
          {actividades.length > 0 ? (
            actividades.map((actividad, index) => (
              <tr key={index}>
                <td>{actividad.actividad}</td>
                <td>{actividad.cantidad_activos}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">No se encontraron actividades para este mantenimiento.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ActividadesPorMantenimiento;
