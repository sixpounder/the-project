const { spawn } = require('child_process');
const log = require('./log');

module.exports = (input, output) => {
  return new Promise((resolve, reject) => {
    // const thread = spawn('ffmpeg', [
    //   '-i',
    //   input,
    //   '-c:v',
    //   'libvpx-vp9',
    //   '-threads',
    //   '4',
    //   '-crf',
    //   '10',
    //   '-b:v',
    //   '1M',
    //   '-c:a',
    //   'libvorbis',
    //   output
    // ]);
    const thread = spawn('ffmpeg', [
      '-i',
      input,
      '-f',
      'mp4',
      '-vcodec',
      'libx264',
      '-preset',
      'fast',
      '-profile:v',
      'main',
      '-acodec',
      'aac',
      output,
      '-hide_banner'
    ]);

    thread.stdout.on('data', (data) => {
      log.debug(data.toString());
    });

    thread.stderr.on('data', (data) => {
      log.debug(data.toString());
    });

    thread.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(code);
      }
    });
  });
};