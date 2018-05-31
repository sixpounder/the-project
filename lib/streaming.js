const shortid    = require('shortid');
const os         = require('os');
const _          = require('lodash');
const mkdirp     = require('mkdirp');
const fs         = require('fs');
const ffmpeg     = require('./ffmpeg');
const log        = require('./log');
const path       = require('path');
const uuid       = require('node-uuid');
const sequelize  = require('../models');
const rimraf     = require('rimraf');
const session    = require(resolveModule('middlewares/session'));

const uploadConf = require(resolveModule('config/uploads'));
const socketUser = require(resolveModule('middlewares/socketUser'));

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

    this.videoIo.use(function (socket, next) {
      socket.request.res = {};
      session(socket.request, socket.request.res, next);
    });
    
    this.chatIo.use(socketUser);

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
        if(vm.videoIo.clientsCount === 0) {
          log.debug('No clients left in channel ' + vm.id + ', allowing 5000ms time buffer before teardown');
          vm.videoIo.closeTimeout = setTimeout(function () {
            vm.teardown();
          }, 5000);
        }
        
        
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
      vm.chatIo.emit('user-joined', socket.user);

      socket.emit('people-sync', []);

      socket.on('message', (msg) => {
        log.debug('Message incoming');
        vm.chatIo.emit('message', { msg: msg, id: shortid.generate(), from: socket.user }); // <-- echoes the message back to the sender as well
      });

      socket.on('disconnect', () => {
        vm.chatIo.emit('user-left', { user: socket.user });
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
        const ffmpegLogFile = fs.createWriteStream(path.resolve(outdir, 'ffmpeg.log'));
        this._segmenter = ffmpeg(vm.clip.fd, outdir).on('error', (err) => {
          log.error(err);
          cb(err);
        }).on('stderr', (buf) => {
          ffmpegLogFile.write(buf + os.EOL);
        }).on('end', () => {
          ffmpegLogFile.end();
        }).run();
        return cb(null, vm);
      }
      
    });
  }

  teardown () {
    const vm = this;
    if (this._segmenter) {
      this._segmenter.kill();
    }
    const outdir = path.resolve(uploadConf.convertedPath, this.clip.uuid, this.id);
    this._freeNsps(`/${this.id}/video`);
    this._freeNsps(`/${this.id}/chat`);
    rimraf(outdir, (err) => {
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