const shortid = require('shortid');
const _ = require('lodash');
const fs = require('fs');
const stream = require('stream');
const log = require('./log');

const stat = function(f) {
  return new Promise((resolve, reject) => {
    fs.stat(f, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
};

/**
 * A class representing a collection of stremings
 */
class Streaming {
  constructor (io) {
    this.io = io;
    this._channels = [];
  }

  /**
   * @private
   */
  getChannel (identifier) {
    return new Promise(resolve => {
      resolve(_.find(this._channels, (ch) => { return ch.id === identifier; })); 
    });
  }

  /**
   * Gets a stream room identified by 'identifier'.
   * @param {string} identifier The channel identifier
   * @public
   * @returns {StreamingChannel} The channel identified by identifier or null if not found
   */
  getStreamChannel (identifier) {
    return new Promise((resolve) => {
      resolve(this.getChannel(identifier));
    });
    
  }

  /**
   * Creates a channel (aka. a new stream room) and adds it to the pool.
   * @param {Clip | string} clip A Clip instance referencing a video that can be streamed to clients, or a path to a file containing said video
   * @returns {StreamingChannel} A new streaming channel
   */
  createChannel (clip = null) {
    return new Promise((resolve, reject) => {
      return this.getReadStreamForResource(clip).then(rs => {
        try {
          const newChannel = new StreamingChannel(rs);
          newChannel.set('stream', rs);
          newChannel.set('clip', clip);
          this._channels.push(newChannel);
          // this.broadcastEvent('channel-created', newChannel);
          resolve(newChannel);
        } catch (e) {
          reject(e);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * @private
   * @param {*} clip A Clip instance referencing a video that can be streamed to clients, or a path to a file containing said video
   * @returns { ReadableStream }
   */
  getReadStreamForResource(clip) {
    return new Promise((resolve, reject) => {
      const fd = _.isString(clip) ? clip : clip.fd;
      log.debug(`Will create read stream for ${fd}`);
      return stat(fd).then(() => {
        resolve(fs.createReadStream(fd));
      }).catch((err) => {
        reject(err);
      });
    });
    
  }

  broadcastEvent (evt, ...args) {
    this.io.broadcast(evt, ...args);
  }
}

/**
 * A single client connected to a stream
 */
class StreamingClient extends stream.Writable {
  constructor (target) {
    super();
    this._socket = target;

    this._write = _.throttle(function(chunk, encoding, done) {
      this._socket.emit('stream', chunk, encoding);
      done();
    }, 1000);
  }
  
}

/**
 * A single streaming channel / room
 */
class StreamingChannel {
  constructor (readable) {
    this._inputStream = readable;
    this._channelId = shortid.generate();
    this._channelOpts = {};
    this._channelClients = [];
    this._currentPosition = 0;
  }

  get id () {
    return this._channelId;
  }

  set (key, value) {
    this._channelOpts[key] = value;
  }

  get (key) {
    return this._opts[key] || null;
  }

  addStreamClient (socket) {
    if(this._channelClients._length === 0) {
      // This is the first client connecting to the stream, means it has to be started somehow
    }
    const newClient = new StreamingClient(socket);
    this._inputStream.pipe(newClient);
    this._channelClients.push(newClient);
  }

  removeStreamClient (client) {
    _.remove(this._channelClients, client);
  }
}



module.exports = { Streaming, StreamingChannel };