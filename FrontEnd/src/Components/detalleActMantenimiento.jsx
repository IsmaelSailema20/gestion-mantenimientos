import React, { useState, useEffect } from "react";
import axios from "axios";

function DetalleActivo({ activo, closeModal }) {
  const [actividades, setActividades] = useState([]);

  useEffect(() => {
    const cargarActividades = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/actividadesPorActivo",
          {
            id: activo.detalle_mantenimiento,
          }
        );
        console.log(response.data);
        setActividades(response.data); // Guardamos las actividades obtenidas en el estado
      } catch (error) {
        console.error("Error al cargar actividades:", error);
      }
    };

    cargarActividades();
  }, [activo.detalle_mantenimiento]);

  return (
    <div
      style={{
        justifyContent: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
        
      <h4
        style={{
          fontWeight: "bold",
          textAlign: "center",
          marginTop: "-12px",
          backgroundColor: "#a32126",
          padding: "15px 20px",
          borderRadius: "5px 5px 0 0",
          color: "white",
          margin: "0",
          width: "102%",
          boxSizing: "border-box",
        }}
      >
        Actividades del activo {activo.numero_serie}
      </h4>

      <span
        className="close"
        style={{
          fontSize: "2rem",
          cursor: "pointer",
          fontWeight: "bold",
          color: "white", // Color blanco para que contraste
          position: "absolute",
          top: "1px",
          right: "10px",
        }}
        onClick={closeModal}
      >
        &times;
      </span>

      <div
        style={{
          marginTop: "15px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <p>
          <strong>Activo:</strong> {activo.tipo_activo}
        </p>
        <p>
          <strong>Tipo Activo:</strong> {activo.tipo}
        </p>
        <p>
          <strong>Marca:</strong> {activo.marca}
        </p>
        <p>
          <strong>Modelo:</strong> {activo.modelo}
        </p>
        <p>
          <strong>Ubicación:</strong> {activo.ubicacion}
        </p>
      </div>
      <div style={{ marginTop: "10px", width: "80%" }}>
        <div
          style={{
            maxHeight: "300px", // Altura máxima para mostrar hasta 6 elementos (ajústala según tu diseño)
            overflowY: "auto", // Activa el scrollbar si el contenido excede la altura
            border: "1px solid #ddd", // Opcional: bordes para el contenedor de la tabla
          }}
        >
          {" "}
          <table
            className="table-bordered"
            style={{ border: "2px solid black", width: "100%" }}
          >
            <thead
              style={{
                backgroundColor: "#a32126",
                height: "50px",
                color: "white",
                textAlign: "center",
              }}
            >
              {" "}
              <tr>
                {/**  <th style={{ borderBottom: "1px solid black", padding: "8px" }}>
                ID
              </th> */}
                <th style={{ borderBottom: "1px solid black", padding: "8px" }}>
                  Actividad
                </th>
                <th style={{ borderBottom: "1px solid black", padding: "8px" }}>
                  Descripción
                </th>
              </tr>
            </thead>
            <tbody>
              {actividades.length > 0 ? (
                actividades.map((actividad) => (
                  <tr key={actividad.id}>
                    {/** <td
                    style={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                  >
                    {actividad.id}
                  </td>*/}
                    <td
                      style={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      {actividad.nombre}
                    </td>
                    <td
                      style={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      {actividad.descripcion}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    style={{
                      textAlign: "center",
                      padding: "10px",
                      color: "gray",
                    }}
                  >
                    No hay actividades asignadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DetalleActivo;
