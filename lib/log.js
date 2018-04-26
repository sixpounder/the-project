const logConfig = require(resolveModule('config/log'));
const winston = require('winston');

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ colorize: true }),
    new (winston.transports.File)({ filename: logConfig.file})
  ],

  level: logConfig.level
});

module.exports = logger;