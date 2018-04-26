const path = require('path');
global.resolveModule = function(...args) {
  return path.resolve(__dirname, ...args);
};

const log = require(resolveModule('lib/log'));

const httpConfig  = require('./config/http');
const server      = require('./server');
const sequelize   = require('./models');


log.info('Starting app...');

sequelize.authenticate().then(() => {
  // DB Connection ok,k sync it
  return sequelize.sync({ force: true });
}).then(() => {
  return server.listen(httpConfig.port);
}).catch(err => {
  log.error(err);
  process.exit(1);
});