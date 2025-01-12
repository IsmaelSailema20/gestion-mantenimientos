import "./App.css";
import "./styles/main.css";

import Main from "./MAIN/Main";
import MantenimientoVisual from "./pages/mantenimientoVisual"; // Importa el componente
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal que renderiza el componente Main */}
        <Route path="/" element={<Main />} />
        
        {/* Ruta para visualizar detalles del mantenimiento */}
        <Route path="/mantenimientoVisual" element={<MantenimientoVisual />} />
      </Routes>
    </Router>
  );
}

export default App;
