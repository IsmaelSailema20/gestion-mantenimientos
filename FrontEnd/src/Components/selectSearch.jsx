import React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

export default function ComboBox({ datos, datosSeleccionado, handleDatoChange,disabled }) {
  return (
    <Autocomplete
      options={datos}
      value={datosSeleccionado.toLowerCase()} // Valor siempre en minúsculas
      onChange={(event, newValue) => {
        handleDatoChange(event, newValue.toLowerCase() || ""); // Al seleccionar, guarda el valor en minúsculas
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label=""
          variant="outlined"
          fullWidth
        />
      )}
      sx={{
        width: "100%", 

        '& .MuiInputBase-root': {
          backgroundColor: disabled ? 'lightgray' : 'white', // Fondo cuando está deshabilitado
          color: disabled ? '#999' : 'black', // Color de texto cuando está deshabilitado
          borderColor: disabled ? '#ccc' : '#3f51b5', // Borde cuando está deshabilitado
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: disabled ? '#ccc' : 'gray', // Borde cuando está deshabilitado
        },
        '& .MuiInputLabel-root': {
          color: disabled ? '#999' : '#3f51b5', // Color de la etiqueta cuando está deshabilitado
        }
      }}
    
      isOptionEqualToValue={(option, value) => option === value} // Comparación estricta de valores
      noOptionsText="No hay opciones disponibles"
      getOptionLabel={(option) => option.charAt(0).toUpperCase() + option.slice(1)} // Solo la opción mostrada con la primera letra en mayúsculas
      disabled={disabled}

    />
  );
}
