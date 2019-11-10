var express = require('express');
var app = express();
var router = express.Router(); // 라우터
var path = require('path');
var bodyParser = require('body-parser');
var connection = require('./mysql.js'); // mysql 연동
var url = require('url');

var engines = require('consolidate');

// view 엔진 사용
/*
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');
app.get('/', function (req, res) {
	res.render('index');
});

*/

app.use(express.static(path.join(__dirname, '/')));
app.use(bodyParser());


app.get('/', function (req, res) {
	res.sendFile(__dirname + '/www/index.html');
});

var name;
var idx;

// 리뷰글목록 가기
app.get('/review', function (req, res) {
	name = req.query.store_name; // store_name 받아오기
	idx = req.query.store_idx;
	res.sendFile(__dirname + '/www/review.html');

	// 리뷰글 가져오기
	app.post('/review_list', function (req, res) {
		var sql = 'select nickname, review from review where name = ?';
		connection.query(sql, [name], function (error, result) {
			res.send(result);
			console.log(result)
		});
	});

	// 리뷰글 작성하기
	app.post('/review_upload', function (req, res) {
		var nickname = req.body.nickname;
		var pw = req.body.pw;
		var review = req.body.review;

		var sql = 'insert into review(idx, name, nickname, pw, review) values(?,?,?,?,?)';
		connection.query(sql, [idx, name, nickname, pw, review], function (error, result) {
			res.sendFile(__dirname + '/www/index.html');
		})
	});
});




// mysql 떡볶이집 정보
connection.connect();

app.post('/map_post', function (req, res) {
	var x_lat = req.body.x_lat;
	var y_lng = req.body.y_lng;

	// 반경 500m
	var sql = 'SELECT *,(6371*acos(cos(radians(?))*cos(radians(x_lat))*cos(radians(y_lng)-radians(?))+sin(radians(?))*sin(radians(x_lat)))) AS distance FROM storelist HAVING distance <= 0.5 ORDER BY distance LIMIT 0,300;'
	connection.query(sql, [x_lat, y_lng, x_lat], function (error, result) {
		res.send(result);
		console.log(result);
	});
});


app.listen(8080, function () {
	console.log('server on!');
});
