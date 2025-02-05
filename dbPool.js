const mysql = require('mysql');

/*
const pool  = mysql.createPool({
    connectionLimit: 10,
    host: "bv2rebwf6zzsv341.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "jn983f0zgtjdma4z",
    password: "qudvcxb90kw5te6s",
    database: "bmaxshtg43yjjx81"
});
*/

const pool  = mysql.createPool({
    connectionLimit: 10,
    host: "g84t6zfpijzwx08q.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "h815wr1okf8bhilm",
    password: "iw4g8oizm8qh0dch",
    database: "ac2ujofznb2xyj1g"
});

module.exports = pool;
