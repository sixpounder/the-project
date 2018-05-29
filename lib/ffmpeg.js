const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

module.exports = (input, output) => {
  return ffmpeg(input, { timeout: 432000 })
    .inputOption('-re')
    .addOptions([
      '-c:a aac',
      '-ac 2',
      '-b:a 128k',
      '-c:v libx264',
      '-f hls',
      // '-profile:v baseline', // baseline profile (level 3.0) for H264 video codec
      '-hls_init_time 5',
      '-hls_flags delete_segments',
      '-hls_flags append_list',
      '-hls_playlist_type event',
      '-level 3.0',
      `-hls_segment_filename ${path.resolve(output, 'chunk%03d.ts')}`,
      '-tune zerolatency',
      '-vsync cfr',
      '-start_number 0',     // start the first .ts segment at index 0
      '-hls_time 2',        // 2 second segment duration
    ])
    .output(`${output}/manifest.m3u8`);
};