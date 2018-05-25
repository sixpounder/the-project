const shortid = require('shortid');
const _       = require('lodash');
// const stream  = require('stream');
const ffmpeg  = require('./ffmpeg');

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
}

class StreamingChannel {
  constructor (id) {
    this.id = id;
    this.connectedClients = [];
    this._clip = null;
    this._segmenter = null;
  }

  spawn () {
    this._segmenter = ffmpeg(this.clip.fd);
  }

  get clip () {
    return this._clip;
  }

  set clip (value) {
    if (value && this._clip === null) {
      this._clip = value;
      if(this.connectedClients.length !== 0) {
        this.spawn();
        this._segmenter.pipe(this.connectedClients[0]);
      }
    }
  }

  get sourceFile () {
    return this.clip ? this.clip.fd : null;
  }

  addClient (writable) {
    this.connectedClients.push(writable);
    if (this.connectedClients.length === 1 && this.clip) {
      this.spawn();
    }
    this._segmenter.pipe(writable);
  }
}

// class Tube extends stream.PassThrough {
//   constructor (options) {
//     super(options);
//   }
// }

const instance = new Streaming();

module.exports = instance;