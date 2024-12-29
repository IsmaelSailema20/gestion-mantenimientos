import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import axios from "axios";

function Componentes({ handleChangeComponent, getInputClass }) {
  const [categorias, setCategorias] = useState({
    procesadores: [],
    ram: [],
    discos: [],
    graficas: [],
    fuentes: [],
  });

  // Cargar los componentes desde la base de datos
  useEffect(() => {
    const fetchComponentes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/componentes"); // Cambia esta URL según tu endpoint
        setCategorias(response.data); // Almacenar las categorías directamente
        console.log(response.data);
      } catch (error) {
        console.error("Error al obtener los componentes:", error);
      }
    };

    fetchComponentes();
  }, []);

  return (
    <div>
      <h5 className="my-3">Componentes del CPU</h5>
      {/* Procesadores */}
      <div className="form-group">
        <label
          htmlFor="procesador"
          style={{
            fontWeight: "bold",
            marginBottom: "10px",
            marginTop: "10px",
          }}
        >
          Procesador
        </label>
        <select
          id="procesador"
          className={getInputClass("procesador")}
          onChange={(e) => handleChangeComponent(e, "procesador")}
        >
          <option value="">Seleccione un Procesador</option>
          {categorias.procesadores.map((procesador) => (
            <option key={procesador.id} value={procesador.id}>
              {procesador.label}
            </option>
          ))}
        </select>
      </div>

      {/* RAM */}
      <div className="form-group">
        <label
          htmlFor="ram"
          style={{
            fontWeight: "bold",
            marginBottom: "10px",
            marginTop: "10px",
          }}
        >
          Memoria RAM
        </label>
        <select
          id="ram"
          className={getInputClass("ram")}
          onChange={(e) => handleChangeComponent(e, "ram")}
        >
          <option value="">Seleccione Memoria RAM</option>
          {categorias.ram.map((ram) => (
            <option key={ram.id} value={ram.id}>
              {ram.label}
            </option>
          ))}
        </select>
      </div>

      {/* Discos */}
      <div className="form-group">
        <label
          htmlFor="disco"
          style={{
            fontWeight: "bold",
            marginBottom: "10px",
            marginTop: "10px",
          }}
        >
          Disco
        </label>
        <select
          id="disco"
          className={getInputClass("disco")}
          onChange={(e) => handleChangeComponent(e, "disco")}
        >
          <option value="">Seleccione un Disco</option>
          {categorias.discos.map((disco) => (
            <option key={disco.id} value={disco.id}>
              {disco.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tarjetas gráficas */}
      <div className="form-group">
        <label
          htmlFor="grafica"
          style={{
            fontWeight: "bold",
            marginBottom: "10px",
            marginTop: "10px",
          }}
        >
          Tarjeta Gráfica
        </label>
        <select
          id="grafica"
          className={getInputClass("grafica")}
          onChange={(e) => handleChangeComponent(e, "grafica")}
        >
          <option value="">Seleccione una Tarjeta Gráfica</option>
          {categorias.graficas.map((grafica) => (
            <option key={grafica.id} value={grafica.id}>
              {grafica.label}
            </option>
          ))}
        </select>
      </div>

      {/* Fuentes de poder */}
      <div className="form-group">
        <label
          htmlFor="fuente"
          style={{
            fontWeight: "bold",
            marginBottom: "10px",
            marginTop: "10px",
          }}
        >
          Fuente de Poder
        </label>
        <select
          id="fuente"
          className={getInputClass("fuente")}
          onChange={(e) => handleChangeComponent(e, "fuente")}
        >
          <option value="">Seleccione una Fuente de Poder</option>
          {categorias.fuentes.map((fuente) => (
            <option key={fuente.id} value={fuente.id}>
              {fuente.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

Componentes.propTypes = {
  handleChangeComponent: PropTypes.func.isRequired,
  getInputClass: PropTypes.func.isRequired, // Asegúrate de que se pase la función
};
export default Componentes;
