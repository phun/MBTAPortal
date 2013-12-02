var express = require('express');
var app = express();

app.set('views', __dirname + '/client');
app.set('view engine', 'jade');

app.get('/', function(req, res) {
  res.render('index.html');
});

app.listen(3000);
console.log('Listening on port 3000');
