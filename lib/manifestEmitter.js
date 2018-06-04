const { EventEmitter } = require('events');
const fs = require('fs');
const { Parser } = require('m3u8-parser');

const BUFFER_SIZE = 3;

class ManifestEmitter extends EventEmitter {
  constructor (manifestPath, options) {
    super(options);
    this.manifestPath = manifestPath;
    this._buffer = [];
    this._manifest = null;
  }

  spawn () {
    if (! this._manifest) {
      fs.readFile(this.manifestPath, (err, contents) => {
        
        if (err) {
          process.nextTick(() => { this.emit('error', err); });
          return;
        }

        const parser = new Parser();
        parser.push(contents);
        parser.end();
        this.manifest = parser.manifest;

        this._buffer.push([
          '#EXTM3U',
          '#EXT-X-VERSION:3',
          '#EXT-X-TARGET-DURATION:2',
          '#EXT-X-PLAYLIST-TYPE EVENT'
        ]);
        
      });
    }
  }

  push (something) {
    this.emit('changed', something);
  }

  tick () {
    const tempBuffer = [];
    let estimatedWaitUntilNextTick = 0;
    while (tempBuffer.length < BUFFER_SIZE) {
      // Take the first element in segments and push it to the buffer
      let next = this._manifest.segments.shift();
      if (next) {
        tempBuffer.push(`#EXT-INF ${next.duration},`);
        estimatedWaitUntilNextTick += next.duration * 1000;
      } else {
        tempBuffer.push('#EXT-X-ENDLIST');
        break;
      }
    }

    this.push([
      this._buffer,
      ...tempBuffer
    ].join('/n'));

    if (tempBuffer.indexOf('#EXT-X-ENDLIST') === -1) {
      // Run the next tick after a fake reading of all emitted chunk is done
      setTimeout(this.tick, estimatedWaitUntilNextTick - 1000); // Subtract one second to allow some time tolerance
    } else {
      this.emit('end');
    }
  }
}

module.exports = ManifestEmitter;