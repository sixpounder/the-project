// HELLO
const express      = require('express');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const fs           = require('fs');

const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
  fs.readFile('views/index.html', 'utf-8', (error, text) => {
    if (error) {
      res.status(500);
      res.end();
    } else {
      res.set('Content-Type', 'text/html');
      res.end(text);
    }
  });
});

app.listen(8080);