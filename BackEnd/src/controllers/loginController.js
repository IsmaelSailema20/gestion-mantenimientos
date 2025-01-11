const connection = require('../models/db');
const jwt = require('jsonwebtoken');

module.exports.login = (req, res) => {
    const { username, password } = req.body;
    const queryUser = "SELECT * FROM USUARIOS WHERE USERNAME = ?";
    const updateAttempts = "UPDATE USUARIOS SET login_attempts = login_attempts + 1 WHERE username = ?";
    const resetAttempts = "UPDATE USUARIOS SET login_attempts = 0 WHERE username = ?";
    const maxAttempts = 3;

    try {
        connection.query(queryUser, [username], (err, result) => {
            if (err) {
                console.error("Error en la consulta:", err);
                return res.status(500).send({ message: "Error en el servidor" });
            }

            if (result.length === 0) {
                return res.status(401).send({ message: "Usuario no encontrado" });
            }

            const user = result[0];

            if (user.login_attempts >= maxAttempts) {
                return res.status(403).send({ message: "Has excedido el número de intentos permitidos. Por favor comunicate con el Administrador." });
            }

            const validatePasswordQuery = "SELECT * FROM USUARIOS WHERE USERNAME = ? AND CAST(AES_DECRYPT(password, 'xyz123') AS CHAR) = ?";
            connection.query(validatePasswordQuery, [username, password], (err, result) => {
                if (err) {
                    console.error("Error al validar contraseña:", err);
                    return res.status(500).send({ message: "Error en el servidor" });
                }

                if (result.length > 0) {
                    // Restablecer intentos fallidos en caso de inicio de sesión exitoso
                    connection.query(resetAttempts, [username], (err) => {
                        if (err) {
                            console.error("Error al restablecer intentos:", err);
                        }
                    });

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
                    return res.status(200).send({ token });
                } else {
                    // Incrementar los intentos fallidos
                    connection.query(updateAttempts, [username], (err) => {
                        if (err) {
                            console.error("Error al actualizar intentos:", err);
                        }
                    });

                    console.log("Credenciales incorrectas");
                    return res.status(401).send({ message: "Credenciales incorrectas" });
                }
            });
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        return res.status(500).send({ message: 'Error interno del servidor' });
    }
};
