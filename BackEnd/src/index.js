const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
const routes = require('./api/endPoints');
// Habilitar CORS para todas las rutas
app.use(cors());

app.use('/',routes);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
//o
