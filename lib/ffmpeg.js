const ffmpeg = require('fluent-ffmpeg');
const log = require('./log');
const path = require('path');

module.exports = (input, output) => {
  return ffmpeg(input, { timeout: 432000, logger: log })
    .inputOption('-re')
    .addOptions([
      '-c:a aac',
      '-ac 2',
      '-b:a 128k',
      '-c:v libx264',
      '-f hls',
      '-profile:v baseline', // baseline profile (level 3.0) for H264 video codec
      '-level 3.0',
      `-hls_segment_filename ${path.resolve(output, 'chunk%03d.ts')}`,
      '-preset ultrafast',
      '-tune zerolatency',
      '-vsync cfr',
      '-start_number 0',     // start the first .ts segment at index 0
      '-hls_time 10',        // 10 second segment duration
      '-hls_list_size 0',    // Maxmimum number of playlist entries (0 means all entries/infinite)
    ])
    .output(`${output}/manifest.m3u8`).on('error', log.error);
};