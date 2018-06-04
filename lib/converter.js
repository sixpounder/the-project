const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const log = require('./log');

module.exports = (input, output) => {
  return new Promise((resolve, reject) => {
    log.info('Converting ' + input + ' to ' + output);
    return ffmpeg(input, { timeout: 432000, logger: log }).addOptions([
      '-c:a aac',
      '-ac 2',
      '-b:a 128k',
      '-c:v libx264',
      '-f hls',
      // '-profile:v baseline', // baseline profile (level 3.0) for H264 video codec
      '-hls_init_time 9',
      '-hls_playlist_type event',
      '-level 3.0',
      `-hls_segment_filename ${path.resolve(output, 'chunk%03d.ts')}`,
      '-tune zerolatency',
      '-vsync cfr',
      '-start_number 0',     // start the first .ts segment at index 0
      '-hls_time 2',        // 2 second segment duration
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