const whitelist = ['localhost:8080'];

const corsDelegate = (req, callback) => {
  const corsOptions = {
    methods: 'GET,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 1000 * 60 * 60 * 24,
    origin: 'http://localhost:8080',
    credentials: true
  };

  // if (whitelist.indexOf(req.header('Host')) !== -1) {
  //   corsOptions.origin = true;
  // } else {
  //   corsOptions.origin = false;
  // }

  callback(null, corsOptions);
};

module.exports = corsDelegate;