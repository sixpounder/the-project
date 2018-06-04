module.exports = {
  task: 'preconvert', // use 'preconvert' to prebuild ts files
  format: 'hls',   // ffmpeg -format parameter
  chunkSize: 2,    // Each .ts chunk will be of this length (in seconds)
  initTime: 5,
  options: [       // Other ffmpeg options
  ]
};
