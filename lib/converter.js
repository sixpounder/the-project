const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const log = require('./log');

module.exports = (input, output) => {
  return new Promise((resolve, reject) => {
    log.info('Converting ' + input + ' to ' + output);
    return ffmpeg(input, { timeout: 432000, logger: log }).addOptions([
      '-codec:v libx264',
      '-f hls',
      '-hls_segment_filename \'chunk%03d.ts\'',
      '-hls_init_time 5',
      '-hls_time 2',
      '-hls_allow_cache 1',
      '-start_number 0',
    ])
      .output(path.resolve(output, 'manifest.m3u8'))
      .on('stderr', (line) => {
        log.info(line);
      })
      .on('error', (err) => {
        log.error(err.message);
        reject(err);
      })
      .on('end', () => {
        resolve(path.resolve(output, 'manifest.m3u8'));
      }).run();
  });
};