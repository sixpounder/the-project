const shortid = require('shortid');
const _       = require('lodash');
const mkdirp  = require('mkdirp');
const fs      = require('fs');
const ffmpeg  = require('./ffmpeg');
const log        = require('./log');
const path       = require('path');
const uploadConf = require(resolveModule('config/uploads'));
const uuid       = require('node-uuid');
const sequelize  = require('../models');

class Streaming {
  constructor (io) {
    this.io = io;
    this.channels = [];
  }

  addChannel (clip) {
    const ch = new StreamingChannel(shortid.generate(), clip, this.io);
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
  constructor (id, clip, io) {
    const vm = this;
    this.io = io;
    this.id = id;
    this.connectedClients = [];
    this._clip = clip;
    this._segmenter = null;
    this.videoIo = io.of(`/${this.id}/video`);
    this.chatIo = io.of(`/${this.id}/chat`);

    this.videoIo.clientsCount = 0;
    this.chatIo.clientsCount = 0;

    this.videoIo.on('connection', (socket) => {
      log.info('A client connected via websocket');
      socket.emit('connected', { token: uuid.v4() });
      if(vm.videoIo.closeTimeout) {
        clearTimeout(vm.videoIo.closeTimeout);
      }
      vm.videoIo.clientsCount++;
      if (vm.videoIo.clientsCount === 1) {
        vm.spawn((err) => {
          if (err) {
            socket.emit('spawn-error', err);
          } else {
            socket.emit('streaming');
          }
        });
      } else {
        socket.emit('streaming');
      }
    
      socket.on('disconnect', () => {
        vm.videoIo.clientsCount--;
        vm.videoIo.closeTimeout = setTimeout(function () {
          if(vm.videoIo.clientsCount === 0) {
            vm.teardown();
          }
        }, 2000);
        
      }).on('authenticate', (userId) => {
        const s = this;
        sequelize.models.user.findOne({ where: { id: userId }}).then(user => {
          if(user) {
            s.user = user;
            socket.emit('authenticated');
            log.debug(`Websocket authenticated for user ${user.email} with id ${user.id}`);
          } else {
            socket.emit('forbidden');
            log.warn(`Websocket cannot authenticate user with id ${userId}`);
          }
        }).catch(err => {
          log.error(err);
          socket.emit('forbidden');
        });
      });
    });

    this.chatIo.on('connection', socket => {
      socket.on('message', (msg) => {
        socket.broadcast.emit('message', { msg: msg, from: socket.user });
      });
    });
  }

  spawn (cb) {
    const vm = this;
    const outdir = path.resolve(uploadConf.convertedPath, this.clip.uuid, this.id);
    mkdirp(outdir, (err) => {
      if(err) {
        return cb(err);
      } else {
        log.info('Created ' + outdir);
        log.info('Spawning ffmpeg segmenter');
        this._segmenter = ffmpeg(vm.clip.fd, outdir).on('error', (err) => {
          log.error(err);
          cb(err);
        }).on('stderr', (buf) => {
          log.debug(buf);
        }).on('end', () => {
          log.debug('Stream ended');
        }).run();
        return cb(null, vm);
      }
      
    });
  }

  teardown () {
    const vm = this;
    this._segmenter = null;
    const outdir = path.resolve(uploadConf.convertedPath, this.clip.uuid, this.id);
    this._freeNsps(`/${this.id}/video`);
    this._freeNsps(`/${this.id}/chat`);
    fs.rmdir(outdir, (err) => {
      if (err) {
        log.error(err);
      } else {
        log.info(`Channel ${vm.id} teardown, dir ${outdir} deleted`);
      }
    });
  }

  get transmitting () {
    return this._segmenter !== null;
  }

  get clip () {
    return this._clip;
  }

  set clip (value) {
    if (value && this._clip === null) {
      this._clip = value;
    }
  }

  get sourceFile () {
    return this.clip ? this.clip.fd : null;
  }

  _freeNsps(namespace) {
    const obj = this.io.of(namespace);
    const connectedSockets = Object.keys(obj.connected);
    connectedSockets.forEach(s => {
      obj.connected[s].disconnect();
    });

    obj.removeAllListeners();
    
    delete this.io.nsps[namespace];
  }
}

module.exports = Streaming;