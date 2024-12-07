import Home from '../pages/home';
import Login from '../pages/PaginaLogin';


function parseJwt(token) {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 3) return null;
    try {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        console.log(jsonPayload);
        return JSON.parse(jsonPayload); // Devuelve el contenido del payload como un objeto.
    } catch (error) {
        console.error("Error al parsear el token:", error);
        return null; // Devuelve null en caso de error.
    }
}
let token = localStorage.getItem('token');
let parsedToken = token ? parseJwt(token) : null;
let tokenExistAndStillValid = parsedToken && parsedToken.exp * 1000 > Date.now();

const Main = () =>{
    return (
       <> {tokenExistAndStillValid ?<Home/> :<Login/> } </> 
   );
}

export default Main;