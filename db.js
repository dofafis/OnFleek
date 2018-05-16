require('dotenv').config();
var mysql = require('mysql');
// Initialize pool
var connection      =    mysql.createPool({
    connectionLimit : 100,
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : 'OnFleek'
});
module.exports = connection;
/*
process.env.DB_HOST,
                user     : process.env.DB_USER,
                database : 'OnFleek',
                password : process.env.DB_PASS

*/
