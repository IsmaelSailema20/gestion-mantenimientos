import { useState } from "react";
import axios from "axios";
import Home from "./home";

function PaginaLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // CAMBIAR LA RUTA DE LA PETICIÓN
      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });
      if (response.data.token) {
        localStorage.setItem("token",response.data.token);
        //window.location.reload();
        setLoginSuccess(true);
      }
      setMessage(response.data.message); // Mostrar el mensaje de éxito desde la solicitud
    } catch (error) {
      setMessage(
        error.response ? error.response.data.message : "Error en la solicitud"
      );
    }
  };

  return (
    <>
      {loginSuccess ? <Home/>  : 
      
    <div
      className="container-fluid min-vh-100 d-flex p-0"
      style={{ height: "100vh" }}
    >
      <div className="d-flex w-100 flex-grow-1">
        {/* Sección Izquierda ocupando el 50% */}
        <div className="p-3" style={{ width: "50%" }}>
          <img src="/IconoLogin.svg" alt="Icono login mantenimientos" />
        </div>

        {/* Sección Derecha ocupando el 50% */}
        <div
          className="bg-principal text-white p-1 d-flex justify-content-center align-items-center flex-column"
          style={{ width: "50%" }}
        >
          {/* Sección Derecha */}
          <h1 className="text-white text-center" style={{ fontWeight: "bold" }}>
            MANTENIMIENTO
          </h1>
          <h1
            className="text-white text-center mb-5"
            style={{ fontWeight: "bold" }}
          >
            ACTIVOS
          </h1>

          {/* Imagen fuera del formulario */}
          <img
            src="/user.png"
            alt="User Icon"
            className="img-fluid rounded-circle"
            style={{
              width: "100px",
              height: "100px",
              marginBottom: "-50px",
              zIndex: "1",
            }}
          />

          <div
            className="bg-light text-black rounded-5"
            style={{
              width: "400px",
              height: "370px",
              paddingTop: "100px",
              paddingInline: "50px",
            }}
          >
            <form onSubmit={handleLogin}>
              <div className="mb-4 position-relative">
                {/* Input de User ID con icono a la derecha */}
                <input
                  type="text"
                  className="form-control pe-5" // Padding para dejar espacio a la derecha
                  id="userID"
                  placeholder="User ID"
                  onChange={(e) => setUsername(e.target.value)}
                />
                <i
                  className="fas fa-user position-absolute top-50 end-0 translate-middle-y me-3" // Posicionamos el icono a la derecha
                  style={{ color: "#aaa" }}
                ></i>
              </div>

              <div className="mb-4 position-relative">
                {/* Input de Password con icono a la derecha */}
                <input
                  type="password"
                  className="form-control pe-5" // Padding para dejar espacio a la derecha
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
                <i
                  className="fas fa-lock position-absolute top-50 end-0 translate-middle-y me-3" // Posicionamos el icono a la derecha
                  style={{ color: "#aaa" }}
                ></i>
              </div>

              <button type="submit" className="btn-principal w-100 text-white">
                LOGIN
              </button>
            </form>
            {message && <p>{message}</p>}
          </div>
        </div>
      </div>
    </div>
  } </> 

  );
}

export default PaginaLogin;
