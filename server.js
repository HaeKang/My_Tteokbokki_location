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
});


// 리뷰글 가져오기
app.post('/review_list', function (req, res) {
	var sql = 'select nickname, review, review_idx from review where name = ?';
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
		//res.sendFile(__dirname + '/www/index.html');
	})

	/*
	res.send({
		"result": "성공"
	});
*/

	var go_url = "http://127.0.0.1:8080/review?store_name=" + encodeURIComponent(name) + "&store_idx=" + encodeURIComponent(idx);
	go_url = String(go_url);
	console.log(go_url);
	res.statusCode = 302;
	res.setHeader('Location', go_url);
	res.end();

});

// 리뷰글 삭제1
app.post('/delete_review', function (req, res) {
	var review_idx = req.body.review_idx;
	var pw = req.body.pw;

	var sql = 'select pw from review where review_idx = ?';
	connection.query(sql, [review_idx], function (error, result) {
		var real_pw = result[0].pw; // mysql에 저장된 비밀번호
		if (pw == real_pw) {
			console.log("같음");
			res.send({
				"result": "같음"
			});
		} else {
			console.log("다름");
			res.send({
				"result": "다름"
			});
		}
	});

});


// 리뷰글 삭제2
app.post('/delete_review2', function (req, res) {
	var review_idx = req.body.review_idx;

	var sql = 'delete from review where review_idx = ?';
	connection.query(sql, [review_idx], function (error, result) {
		res.send({
			"result": "삭제성공"
		});
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
