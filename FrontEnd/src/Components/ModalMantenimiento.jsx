import React, { useState } from 'react';

const ModalMantenimiento = ({ isOpen, onClose, onSubmit }) => {
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [identificador, setIdentificador] = useState('');

  const handleSubmit = () => {
    if (!tipo || !descripcion || !identificador) {
      alert('Por favor completa todos los campos');
      return;
    }
    onSubmit({ tipo, descripcion, identificador });
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <h2>Crear Mantenimiento</h2>
      <select onChange={(e) => setTipo(e.target.value)} value={tipo}>
        <option value="">Seleccionar Tipo</option>
        <option value="preventivo">Preventivo</option>
        <option value="correctivo">Correctivo</option>
      </select>
      <textarea
        placeholder="Descripción"
        onChange={(e) => setDescripcion(e.target.value)}
        value={descripcion}
      />
      <input
        type="text"
        placeholder="Cédula o RUC"
        onChange={(e) => setIdentificador(e.target.value)}
        value={identificador}
      />
      <button onClick={handleSubmit}>Crear</button>
      <button onClick={onClose}>Cancelar</button>
    </div>
  );
};

export default ModalMantenimiento;
