const connection = require('../models/db');
const jwt = require('jsonwebtoken');
module.exports.login = (req, res) => {
    const { username, password } = req.body;
    const cons = "SELECT * FROM USUARIOS WHERE USERNAME = ? AND PASSWORD = ?";
    try {
        connection.query(cons, [username, password], (err, result) => {
            if (err) {
                res.send(err);
            }
            if (result.length > 0) {
                const token = jwt.sign({
                    cedula: result[0].cedula,
                    username: result[0].username, rol: result[0].rol,
                }, "stack", { expiresIn: '1h' })
                console.log(token);
                return res.send({ token });

            } else {
                console.log("Credenciales incorrectas");
                res.send("Credenciales incorrectas");
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Internal server error' });
    }
};