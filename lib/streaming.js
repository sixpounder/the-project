const shortid = require('shortid');
const _       = require('lodash');
const mkdirp  = require('mkdirp');
const ffmpeg  = require('./ffmpeg');
const log  = require('./log');
const path = require('path');
const uploadConf = require(resolveModule('config/uploads'));

class Streaming {
  constructor () {
    this.channels = [];
  }

  addChannel (clip) {
    const ch = new StreamingChannel(shortid.generate());
    if (clip) {
      ch.clip = clip;
    }
    this.channels.push(ch);

    return ch;
  }

  getChannel (id) {
    return _.find(this.channels, (ch) => { return ch.id === id; });
  }

  updateManifestForChannel(id, buffer) {
    try {
      this.getChannel(id).updateManifest(buffer);  
    } catch (e) {
      log.error('Channel not found', e);
    }
    
  }
}

class StreamingChannel {
  constructor (id) {
    this.id = id;
    this.connectedClients = [];
    this._clip = null;
    this._segmenter = null;
  }

  spawn (cb) {
    const vm = this;
    log.info('Spawning ffmpeg segmenter');
    const outdir = path.resolve(uploadConf, this.clip.uuid, this.id);
    mkdirp(outdir, (err) => {
      if(err) {
        return cb(err);
      } else {
        log.info('Created ' + outdir);
        this._segmenter = ffmpeg(vm.clip.fd, outdir);
        return cb(null, vm);
      }
      
    });
    
  }

  get clip () {
    return this._clip;
  }

  set clip (value) {
    if (value && this._clip === null) {
      this._clip = value;
      if(this.connectedClients.length !== 0) {
        this.spawn((err, vm) => {
          if (err) { log.error(err); }
        });
      }
    }
  }

  get sourceFile () {
    return this.clip ? this.clip.fd : null;
  }

  addClient (writable) {
    this.connectedClients.push(writable);
    if (this.connectedClients.length === 1 && this.clip) {
      this.spawn((err, vm) => {
        if (err) { log.error(err); }
      });
    }
  }
}

// class Tube extends stream.PassThrough {
//   constructor (options) {
//     super(options);
//   }
// }

const instance = new Streaming();

module.exports = instance;