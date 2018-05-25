const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const cmdexists = require('command-exists');

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
        mkdirp(dir, (err) => {
          if(err) {
            log.error(err);
            reject(err);
          } else {
            log.info('Created directory ' + dir);
            resolve();
          }
        });
      } else {
        log.debug(`${dir} exists, and it is writable`);
        resolve();
      }
    });
    
  });
};

const ensureCommand = function(cmd) {
  return new Promise((resolve, reject) => {
    log.info('Ensuring command ' + cmd + ' exists');
    cmdexists('ffmpeg', (err, commandExists) => {
      if (err) {
        reject(err);
      } else {
        if (commandExists) {
          resolve(commandExists);
        } else {
          reject();
        }
      }
    });
  });
};


log.info('Starting app...');

ensureDir(uploadsConfig.path).then(() => {
  return ensureDir(uploadsConfig.convertedPath);
}).then(() => {
  return ensureCommand('ffmpeg');
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