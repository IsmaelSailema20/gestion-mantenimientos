const mysql = require('mysql2');

const connection = mysql.createConnection({
   host: 'localhost',
   user: 'root',
   password: '1804893517',
   database: 'BDDMANTENIMIENTOS'
});

connection.connect((err) => {
   if (err) {
      console.error('Error connecting to the database:', err);
      return;
   }
   console.log('Connected to the database!');
});

module.exports = connection;
