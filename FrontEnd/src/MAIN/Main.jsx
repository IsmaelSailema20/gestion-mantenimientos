import React, { useEffect, useState } from "react";
import Home from "../pages/home";
import Login from "../pages/PaginaLogin";
import '../styles/modalx.css';

export function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

const Main = () => {
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const parsedToken = parseJwt(token);
      const expirationTime = parsedToken.exp * 1000; // Convertir a milisegundos
      const currentTime = Date.now();

      if (expirationTime > currentTime) {
        // Configurar un temporizador para cuando el token expire
        const timeUntilExpiration = expirationTime - currentTime;
        const timer = setTimeout(() => {
          setIsTokenValid(false);
          setShowModal(true); // Mostrar modal cuando el token expire
        }, timeUntilExpiration);

        return () => clearTimeout(timer); // Limpiar el temporizador al desmontar
      } else {
        // Token ya expiró
        setIsTokenValid(false);
        setShowModal(true);
      }
    } else {
      // No hay token
      setIsTokenValid(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setShowModal(false);
  };

  return (
    <>
      {isTokenValid ? <Home /> : <Login />}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="error-icon">×</div>
            <h2>Sesión Expirada</h2>
            <p>Tu sesión ha caducado. Por favor, inicia sesión nuevamente.</p>
            <button onClick={handleLogout}>Aceptar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Main;
