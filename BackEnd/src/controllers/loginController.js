const connection = require('../models/db');
const jwt = require('jsonwebtoken');

module.exports.login = (req, res) => {
    const { username, password } = req.body;
    const cons = "SELECT * FROM USUARIOS WHERE USERNAME = ? AND CAST(AES_DECRYPT(password, 'xyz123') AS CHAR) = ?";

    try {
        connection.query(cons, [username, password], (err, result) => {
            if (err) {
                console.error("Error en la consulta:", err);
                return res.status(500).send(err); // Detenemos el flujo con return
            }

            if (result.length > 0) {
                const token = jwt.sign(
                    {
                        cedula: result[0].cedula,
                        username: result[0].username,
                        rol: result[0].rol,
                    },
                    "stack",
                    { expiresIn: '1h' }
                );
                console.log("Token generado:", token);
                return res.status(200).send({ token }); // Detenemos el flujo con return
            } else {
                console.log("Credenciales incorrectas");
                return res.status(401).send("Credenciales incorrectas"); // Detenemos el flujo con return
            }
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        return res.status(500).send({ message: 'Internal server error' }); // Detenemos el flujo con return
    }
};
