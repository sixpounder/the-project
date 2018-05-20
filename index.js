const path = require('path');
const fs = require('fs');

global.resolveModule = function(...args) {
  return path.resolve(__dirname, ...args);
};

const log = require(resolveModule('lib/log'));

const httpConfig  = require('./config/http');
const uploadsConfig  = require('./config/uploads');
const { server } = require('./server');
const sequelize   = require('./models');

const ensureUploadsDir = function () {
  return new Promise((resolve, reject) => {
    fs.access(uploadsConfig.path, fs.constants.F_OK | fs.constants.W_OK, (err) => {
      if (err) {
        // log.error(`${uploadsConfig.path} ${err.code === 'ENOENT' ? 'does not exist' : 'is read-only'}`);
        fs.mkdir(uploadsConfig.path, (err) => {
          if(err) {
            log.error(err);
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        log.debug(`${uploadsConfig.path} exists, and it is writable`);
        resolve();
      }
    });
    
  });
};

log.info('Starting app...');

ensureUploadsDir().then(() => {
  return sequelize.authenticate();
}).then(() => {
  // DB Connection ok,k sync it
  return sequelize.sync();
}).then(() => {
  return server.listen(httpConfig.port);
}).catch(err => {
  log.error(err);
  process.exit(1);
});