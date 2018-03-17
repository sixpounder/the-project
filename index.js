const express      = require('express');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const fs           = require('fs');
const path         = require('path');
const logger       = require('morgan');

const PagesController = require('./api/controllers/PagesController');

const mainRouter   = require('./routes/main');

const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.static(path.resolve(__dirname, 'public')));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/', mainRouter);

app.use(PagesController.notFoundHandler);

app.use(function(err, req, res, next) {
  res.status(500).render('500', { error: err });
});

app.listen(8080);