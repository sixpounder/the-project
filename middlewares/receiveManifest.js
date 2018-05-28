const Busboy = require('busboy');
const log = require('../lib/log');
// const fs = require('fs');
// const conf = require('../config/uploads');
// const path = require('path');
// const shortid = require('shortid');

const middleware = (req, res, next) => {
  const busboy = new Busboy({ headers: req.headers });
  req.files = [];
  
  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    log.debug('Receiving manifest with name ' + filename);
    const data = [];

    file.on('data', (chunk) => {
      data.push(chunk);
    });

    file.on('end', () => {
      req.files.push({ mimetype, filename, data: Buffer.concat(data) });
    });
  });

  busboy.on('field', (fieldname, value) => {
    req.body[fieldname] = value;
  });

  busboy.on('finish', () => {
    log.debug('Manifest received');
    next();
  });

  req.pipe(busboy);
};

module.exports = middleware;