const connection = require('../models/db');
module.exports.ping=(req,res)=>{
    const cons="SELECT * FROM USUARIOS";
connection.query(cons,(err,res)=>{
console.log(res);
});

}