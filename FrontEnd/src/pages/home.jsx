import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
    const [activos, setActivos] = useState([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const elementosPorPagina = 15; // Número de elementos por página

    useEffect(() => {
        const fetchActivos = async () => {
            try {
                const response = await axios.get('http://localhost:5000/activos'); // Ajusta la URL según tu configuración
                setActivos(response.data);
            } catch (error) {
                console.error("Error al obtener los datos:", error);
            }
        };

        fetchActivos();
    }, []);

    const handleActualizar = (activo) => {
        console.log("Actualizar activo:", activo);
        // Agrega tu lógica para actualizar el activo aquí
    };

    const indiceInicial = (paginaActual - 1) * elementosPorPagina;
    const indiceFinal = indiceInicial + elementosPorPagina;
    const activosPaginados = activos.slice(indiceInicial, indiceFinal);

    const totalPaginas = Math.ceil(activos.length / elementosPorPagina);

    const handlePaginaSiguiente = () => {
        if (paginaActual < totalPaginas) {
            setPaginaActual(paginaActual + 1);
        }
    };

    const handlePaginaAnterior = () => {
        if (paginaActual > 1) {
            setPaginaActual(paginaActual - 1);
        }
    };

    return (
        <>
            {/* Cabecera */}
            <div style={{ backgroundColor: 'rgb(163, 33, 38)', color: 'white', height: '100px' }} className="d-flex justify-content-between align-items-center px-4 py-2">
                <div className="d-flex align-items-center">
                    <div 
                        style={{ 
                            backgroundColor: 'white', 
                            color: 'black', 
                            padding: '10px 20px', 
                            borderRadius: '35px', 
                            fontSize: '20px', 
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Mantenimientos
                    </div>
                </div>
                <div className="d-flex align-items-center">
                    <button className="btn text-white d-flex align-items-center">
                        <img 
                            src="/SESION CERR.png" 
                            alt="Cerrar Sesión" 
                            style={{ width: '50px', height: '50px', marginRight: '8px' }} 
                        />
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="container mt-4">
                <h1 className="mb-4">Bienvenido User</h1>

                <div className="mb-3 d-flex gap-3">
                    <button className="btn" style={{ backgroundColor: 'rgb(163, 33, 38)', color: 'white' }}>Registro Individual</button>
                    <button className="btn" style={{ backgroundColor: 'rgb(163, 33, 38)', color: 'white' }}>Registro por Lotes</button>
                </div>

                {/* Tabla con scroll horizontal */}
                <div className="table-responsive">
                    <table className="table-bordered" style={{ border: '2px solid black', width: '100%' }}>
                        <thead className="p-4" style={{ backgroundColor: '#921c21', height: '50px', color: 'white', textAlign: 'center' }}>
                            <tr>
                                <th>Codigo</th>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Ubicación</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody style={{ textAlign: 'center' }}>
                            {activosPaginados.length > 0 ? (
                                activosPaginados.map((activo, index) => (
                                    <tr key={index} style={{ height: '60px' }}>
                                        <td>{activo.Codigo}</td>
                                        <td>{activo.Nombre}</td>
                                        <td>{activo.Tipo}</td>
                                        <td>{activo.Ubicación}</td>
                                        <td>{activo.Estado}</td>
                                        <td className="text-center">
                                            <button 
                                                className="btn d-flex align-items-center" 
                                                style={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}
                                                onClick={() => handleActualizar(activo)}
                                            >
                                                <img 
                                                    src="/actualizar.png" 
                                                    alt="Actualizar" 
                                                    style={{ width: '44px', height: '34px', marginRight: '8px' }} 
                                                />
                                                Actualizar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr style={{ height: '60px' }}>
                                    <td colSpan="6" className="text-center">No hay datos disponibles</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Controles de paginación */}
                <div className="d-flex justify-content-between mt-4" style={{ gap: '20px' }}>
                    <button 
                        className="btn" 
                        style={{ backgroundColor: 'rgb(163, 33, 38)', color: 'white' }} 
                        onClick={handlePaginaAnterior}
                        disabled={paginaActual === 1}
                    >
                        Anterior
                    </button>
                    <button 
                        className="btn" 
                        style={{ backgroundColor: 'rgb(163, 33, 38)', color: 'white' }} 
                        onClick={handlePaginaSiguiente}
                        disabled={paginaActual === totalPaginas}
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </>
    );
};

export default Home;
