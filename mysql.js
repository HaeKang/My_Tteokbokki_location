// mysql 연동
var mysql = require('mysql');
var connection = mysql.createConnection({
	host: '127.0.0.1',
	user: 'root',
	password: '1234',
	port: 3306,
	database: 'test'
});

module.exports = connection;