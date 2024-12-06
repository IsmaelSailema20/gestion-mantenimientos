const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// Habilitar CORS para todas las rutas
app.use(cors());

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
//o
app.get('/', (req, res) => {
    res.send('Hello from Express!');
  });