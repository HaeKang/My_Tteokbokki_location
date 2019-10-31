var express = require('express');
var path = require('path');
var app = express();

//ejs 셋팅
app.set('view engine', 'ejs');


// mysql 연동
var mysql = require('mysql');
var connection = mysql.createConnection({
	host: '127.0.0.1',
	user: 'root',
	password: '1234',
	port: 3306,
	database: 'test'
});

//mysql test
connection.connect();
connection.query('select * from test_table', function (err, rows, fields) {
	if (!err)
		console.log('The solution is : ', rows);
	else
		console.log('Error while performing Query.', err);
});


// 파일들 불러옴
app.use(express.static(path.join(__dirname, '/')));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/www/index.html');
});


// mysql 떡볶이집 list 여기 안됨ㅠ
app.all('/list', function(request, response){
	
	var x_lat = request.param('x_lat');
	var y_lng = request.param('y_lng');
	
	// 반경 500m
	var sql = 'SELECT *,(6371*acos(cos(radians(?))*cos(radians(x_lat))*cos(radians(y_lng)-radians(?))+sin(radians(?))*sin(radians(x_lat)))) AS distance FROM test_table HAVING distance <= 0.5 ORDER BY distance LIMIT 0,300'
	connection.query(sql,[x_lat, y_lng, x_lat], function(error, result){
		response.send(result);
		console.log("server " + result);
		console.log("server error " + error);
		console.log("x_lat " + x_lat );
		console.log("y_lng " + y_lng);
	});
	
});



app.get('/index', function(req, res){
	res.render('index');
});


// 서버 시작
var server = app.listen(8080, function () {
	console.log('load Success!');

});