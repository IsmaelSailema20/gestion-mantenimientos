import Home from '../pages/home';
import Login from '../pages/PaginaLogin';


export function parseJwt (token) {
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
let token = localStorage.getItem('token');
let parsedToken = token ? parseJwt(token) : null;
let tokenExistAndStillValid = parsedToken && parsedToken.exp * 1000 > Date.now();

const Main = () =>{
    return (
       <> {tokenExistAndStillValid ?<Home/> :<Login/> } </> 
   );
}

export default Main;