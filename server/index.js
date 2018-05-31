const express         = require('express');
const cookieParser    = require('cookie-parser');
const bodyParser      = require('body-parser');
const path            = require('path');
const logger          = require('morgan');
const session         = require(resolveModule('middlewares/session'));
const sessionCheck    = require(resolveModule('middlewares/sessionCheck'));
const cors            = require(resolveModule('middlewares/cors'));
const PagesController = require(resolveModule('api/controllers/PagesController'));
const mainRouter      = require(resolveModule('routes/main'));
const authRouter      = require(resolveModule('routes/auth'));
const contentRouter   = require(resolveModule('routes/content'));
const streamingRouter = require(resolveModule('routes/streaming'));

const Socket          = require('socket.io');
const http            = require('http');
const Streaming       = require('../lib/streaming');

const app = express();
const server = http.Server(app);
const io = Socket(server);

const streamingManager = new Streaming(io);

app.set('views', __dirname + '/../views');
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(cors);
app.use(express.static(path.resolve(__dirname, 'public')));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session);

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