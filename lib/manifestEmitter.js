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
    this._tickCount = 0;
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
        this._manifest = parser.manifest;

        this._buffer = [
          '#EXTM3U',
          '#EXT-X-VERSION:' + this._manifest.mediaSequence,
          '#EXT-X-TARGETDURATION:' + this._manifest.targetDuration,
          '#EXT-X-MEDIA-SEQUENCE:0',
          '#EXT-X-PLAYLIST-TYPE:EVENT'
        ];

        this.tick();
        
      });
    }
  }

  push (something) {
    if (something && something.indexOf('#EXTINF' !== -1)) {
      this.emit('changed', something);
    }
  }

  tick () {
    let estimatedWaitUntilNextTick = 0;
    let count = 0;
    while (count < BUFFER_SIZE) {
      // Take the first element in segments and push it to the buffer
      let next = this._manifest.segments.shift();
      if (next) {
        this._buffer.push(`#EXTINF:${next.duration},`);
        this._buffer.push(next.uri);
        estimatedWaitUntilNextTick += next.duration * 1000;
        count++;
      } else {
        this._buffer.push('#EXT-X-ENDLIST');
        break;
      }
    }

    if (this._tickCount === 0) {
      this.emit('playlist');
    }

    this._tickCount++;

    this.push(this._buffer.join('\n'));

    if (this._buffer.indexOf('#EXT-X-ENDLIST') === -1) {
      // Run the next tick after a fake reading of all emitted chunk is done
      setTimeout(() => { this.tick(); }, estimatedWaitUntilNextTick - 1000); // Subtract one second to allow some time tolerance
    } else {
      this.emit('end');
    }
  }

  get contents () {
    return this._buffer.join('\n');
  }
}

module.exports = ManifestEmitter;