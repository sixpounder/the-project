const express         = require('express');
const cookieParser    = require('cookie-parser');
const bodyParser      = require('body-parser');
const path            = require('path');
const logger          = require('morgan');
const sessionCheck    = require(resolveModule('middlewares/sessionCheck'));
const socketUser    = require(resolveModule('middlewares/socketUser'));
const PagesController = require(resolveModule('api/controllers/PagesController'));
const mainRouter      = require(resolveModule('routes/main'));
const authRouter      = require(resolveModule('routes/auth'));
const contentRouter   = require(resolveModule('routes/content'));
const streamingRouter = require(resolveModule('routes/streaming'));
const session         = require('express-session');
const FileStore       = require('session-file-store')(session);
const _               = require('lodash');
const Socket          = require('socket.io');
const http            = require('http');
const log             = require('../lib/log');
const Streaming       = require('../lib/streaming');

const whitelist = ['localhost:8080', 'http://localhost:8080'];

const app = express();
const server = http.Server(app);
const io = Socket(server);

io.use(function (socket, next) {
  socket.request.res = {};
  sessionMiddleware(socket.request, socket.request.res, next);
});

io.use(socketUser);

const streamingManager = new Streaming(io);

app.set('views', __dirname + '/../views');
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(function(req, res, next) {
  
  res.header('Access-Control-Allow-Credentials', true);

  // origin can not be '*' when crendentials are enabled. so need to set it to the request origin (if whitelisted)
  res.header('Access-Control-Allow-Origin', _.indexOf(whitelist, req.headers.origin) !== -1 ? req.headers.origin : null);

  // list of methods that are supported by the server
  res.header('Access-Control-Allow-Methods','OPTIONS,GET,PUT,POST,DELETE');

  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');

  next();
});
app.use(express.static(path.resolve(__dirname, 'public')));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sessionMiddleware = session({
  store: new FileStore(),
  secret: '2379t4reg97o342tgfr9oi7342tgfr45',
  saveUninitialized: true,
  resave: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
});

app.use(sessionMiddleware);

app.use(sessionCheck);

app.use((req, res, next) => {
  req.streamingManager = streamingManager;
  next();
});

// Routes
app.use('/', mainRouter);
app.use('/api/auth', authRouter);
app.use('/api/content', contentRouter);
app.use('/api/streaming', streamingRouter);

app.use(PagesController.notFoundHandler);

app.use(function(err, req, res) {
  res.status(500).render('500', { error: err });
});

module.exports = {
  server: server,
  app: app,
  socket: io
};