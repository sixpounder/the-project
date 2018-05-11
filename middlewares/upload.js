const Busboy = require('busboy');
const log = require('../lib/log');
const fs = require('fs');
const conf = require('../config/uploads');
const path = require('path');

const middleware = (req) => {
  const busboy = new Busboy({ headers: req.headers });
  req.files = [];
  
  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    log.debug('Receiving file with name ' + filename);
    const fd = path.resolve(conf.path, filename);
    const wr = fs.createWriteStream(fd);
    const data = [];

    file.pipe(wr);

    file.on('data', (chunk) => {
      data.push(chunk);
    });

    file.on('end', () => {
      req.files.push({ fd, mimetype, filename, data: Buffer.concat(data) });
    });
  });

  busboy.on('finish', () => {
    log.debug('Finish uploading');
  });

  req.pipe(busboy);
};

module.exports = middleware;