const ffmpeg = require('fluent-ffmpeg');
const log = require('./log');

module.exports = (input, output) => {
  return new Promise((resolve, reject) => {
    log.info('Converting ' + input + ' to ' + output);
    return ffmpeg(input, { timeout: 432000, logger: log }).addOptions([
      '-profile:v baseline', // baseline profile (level 3.0) for H264 video codec
      '-level 3.0',
      '-start_number 0',     // start the first .ts segment at index 0
      '-hls_time 10',        // 10 second segment duration
      '-hls_list_size 0',    // Maxmimum number of playlist entries (0 means all entries/infinite)
      '-f hls'               // HLS format
    ])
      .output(output)
      .on('stderr', (line) => {
        log.info(line);
      })
      .on('error', (err) => {
        log.error(err.message);
        reject(err);
      })
      .on('end', () => {
        resolve(output);
      }).run();
  });
};