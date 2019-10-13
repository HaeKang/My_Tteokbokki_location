var express = require('express');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname,'/')));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/www/index.html');
});



var server = app.listen(8080, function(){
	console.log('load Success!');
});
