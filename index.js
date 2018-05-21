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

const ensureDir = function (dir) {
  return new Promise((resolve, reject) => {
    fs.access(dir, fs.constants.F_OK | fs.constants.W_OK, (err) => {
      if (err) {
        // log.error(`${uploadsConfig.path} ${err.code === 'ENOENT' ? 'does not exist' : 'is read-only'}`);
        fs.mkdir(dir, (err) => {
          if(err) {
            log.error(err);
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        log.debug(`${dir.path} exists, and it is writable`);
        resolve();
      }
    });
    
  });
};


log.info('Starting app...');

ensureDir(uploadsConfig.path).then(() => {
  return ensureDir(uploadsConfig.convertedPath);
}).then(() => {
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