import React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

export default function ComboBox({
  datos, // Recibe las actividades filtradas
  datosSeleccionado, // Recibe el id de la actividad seleccionada
  handleDatoChange, // Recibe la función para manejar el cambio
  propiedad,
  label,
  disabled,
}) {
  return (
    <Autocomplete
      options={datos} // Actividades filtradas
      value={
        datosSeleccionado
          ? datos.find((actividad) => actividad.id === datosSeleccionado) // Encuentra la actividad seleccionada
          : null // Si no hay actividad seleccionada, pasa null
      }
      onChange={(event, newValue) => {
        // Si newValue no es null, pasa el id de la actividad seleccionada
        handleDatoChange(event, newValue ? newValue.id : null);
      }}
      getOptionLabel={(option) => option[propiedad]} // Muestra el nombre de la actividad
      renderInput={(params) => (
        <TextField {...params} label={label} variant="outlined" fullWidth />
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
      
      
      isOptionEqualToValue={(option, value) => option.id === value.id} // Comparar por id
      noOptionsText="No hay opciones disponibles"
      disabled={disabled}
    />
  );
}
