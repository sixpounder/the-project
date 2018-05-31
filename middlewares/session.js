const session         = require('express-session');
const FileStore       = require('session-file-store')(session);

const sessionMiddleware = session({
  store: new FileStore(),
  secret: '2379t4reg97o342tgfr9oi7342tgfr45',
  saveUninitialized: true,
  resave: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
});

module.exports = sessionMiddleware;