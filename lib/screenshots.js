const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const log = require('./log');

module.exports = (input, output) => {
  return new Promise((resolve, reject) => {
    log.info('Generating screenshots for ' + input + ' into ' + output);
    return ffmpeg(input)
      .on('stderr', (line) => {
        log.info(line);
      })
      .on('error', (err) => {
        log.error(err.message);
        reject(err);
      })
      .on('end', () => {
        log.info('Screenshots generated');
        resolve(output);
      })
      .screenshots({
        count: 4,
        filename: 'thumbnail-%i.png',
        folder: output,
        size: '320x240'
      });
  });
};