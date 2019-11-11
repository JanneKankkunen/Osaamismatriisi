const mysql = require('mysql')


var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'osaamismatriisi'
})

connection.connect()

module.exports = connection