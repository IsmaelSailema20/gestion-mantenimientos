import Home from '../pages/home';
import Login from '../pages/PaginaLogin';
import ErrorModal from '../Components/ErrorModal';
import { useState, useEffect } from 'react';

export function parseJwt(token) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
        window
            .atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
    );

    return JSON.parse(jsonPayload);
}

const Main = () => {
    const [showModal, setShowModal] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState(null);
    const [isTokenChecked, setIsTokenChecked] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            const parsedToken = parseJwt(token);
            const expirationTime = parsedToken.exp * 1000; // Convertir a milisegundos
            const currentTime = Date.now();

            if (expirationTime > currentTime) {
                setIsTokenValid(true);
                setIsTokenChecked(true);

                const timeUntilExpiration = expirationTime - currentTime;

                // Configurar el temporizador para mostrar el modal al expirar
                const timer = setTimeout(() => {
                    setIsTokenValid(false);
                    setShowModal(true); // Mostrar el modal una vez cuando expire
                }, timeUntilExpiration);

                return () => clearTimeout(timer); // Limpiar temporizador al desmontar
            } else {
                // Token ya expiró
                setIsTokenValid(false);
                setIsTokenChecked(true);
                setShowModal(true); // Mostrar el modal inmediatamente
            }
        } else {
            // No hay token
            setIsTokenValid(false);
            setIsTokenChecked(true);
        }
    }, []); // Ejecutar solo al montar

    const handleCloseModal = () => {
        setShowModal(false); // Cerrar el modal
        localStorage.removeItem('token'); // Eliminar token caducado
    };

    if (!isTokenChecked) {
        // Mostrar un indicador de carga mientras se verifica el token
        return <div>Cargando...</div>;
    }

    return (
        <>
            {showModal && (
                <ErrorModal
                    titulo="Sesión caducada"
                    mensaje="Tu sesión ha expirado. Por favor, vuelve a iniciar sesión."
                    onClose={handleCloseModal}
                />
            )}
            {isTokenValid ? <Home /> : <Login />}
        </>
    );
};

export default Main;
