const ffmpeg = require('fluent-ffmpeg');

module.exports = (input, output) => {
  return new Promise((resolve, reject) => {
    ffmpeg(input, { timeout: 4320000 }).addOptions([
      '-profile:v baseline', // baseline profile (level 3.0) for H264 video codec
      '-level 3.0', 
      '-start_number 0',     // start the first .ts segment at index 0
      '-hls_time 10',        // 10 second segment duration
      '-hls_list_size 0',    // Maxmimum number of playlist entries (0 means all entries/infinite)
      '-f hls'               // HLS format
    ])
      .output(output)
      .on('error', reject)
      .on('end', () => {
        resolve(output);
      }).run();
  });
};