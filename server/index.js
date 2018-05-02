const express         = require('express');
const cookieParser    = require('cookie-parser');
const bodyParser      = require('body-parser');
const path            = require('path');
const logger          = require('morgan');
const PagesController = require(resolveModule('api/controllers/PagesController'));
const mainRouter      = require(resolveModule('routes/main'));
const authRouter      = require(resolveModule('routes/auth'));
const session         = require('express-session');

const app = express();

app.set('views', __dirname + '/../views');
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.static(path.resolve(__dirname, 'public')));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: '2379t4reg97o342tgfr9oi7342tgfr45',
  saveUninitialized: true,
  resave: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Routes
app.use('/', mainRouter);
app.use('/api/auth', authRouter);

app.use(PagesController.notFoundHandler);

app.use(function(err, req, res) {
  res.status(500).render('500', { error: err });
});

module.exports = app;