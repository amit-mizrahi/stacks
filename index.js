var express = require('express');
var path = require('path');

var app = express();

app.engine('.html', require('ejs').renderFile);
app.use('/static',express.static('static'));
app.use(require('body-parser').urlencoded({extended: false}));

app.get('/', function(req, res) {
	res.render('index.html');
});

console.log('App listening on port ' + (process.env.PORT || 1997));
app.listen(process.env.PORT || 1997);
