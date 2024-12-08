const Home = () => {
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
                    <table className="table table-bordered">
                        <thead style={{ backgroundColor: 'rgb(163, 33, 38)', color: 'white' }} className="text-center">
                            <tr>
                                <th>Codigo</th>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Ubicación</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Relleno dinámico desde la BD */}
                        </tbody>
                    </table>
                </div>

                <div className="d-flex justify-content-between">
                    <button className="btn" style={{ backgroundColor: 'rgb(163, 33, 38)', color: 'white' }}>Anterior</button>
                    <button className="btn" style={{ backgroundColor: 'rgb(163, 33, 38)', color: 'white' }}>Siguiente</button>
                </div>
            </div>
        </>
    );
};

export default Home;
