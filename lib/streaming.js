const log = require('./log');
const shortid = require('shortid');
const _ = require('lodash');

class Streaming {
  constructor (videoChannel, chatChannel) {
    this.videoChannel = videoChannel;
    this.chatChannel = chatChannel;
    this.channels = [];

    this.attach();
  }

  attach () {
    const vm = this;
    this.videoChannel._streamingProps = {
      masterTime: 0
    };

    this.videoChannel.on('connection', (socket) => {

      socket.on('join-stream-room', (room) => {
        let isMaster = true;
        
        if (vm.videoChannel.rooms.indexOf(room) !== -1) {
          isMaster = true;
        }

        socket.join(room);
        
        socket.emit('joined-stream-room', room, isMaster);
      });

      socket.on('timeupdate', (room, masterTime) => {
        vm.videoChannel._streamingProps.masterTime = masterTime;    
        vm.videoChannel.to('room').emit('progress', masterTime);
      });

      socket.on('sync', () => {
        socket.emit('sync', vm.videoChannel._streamingProps.masterTime);
      });
    });
    
    
    this.chatChannel.on('connection', (socket) => {
      log.info('A client connected to chat socket');
    
      socket.on('join-room', (room) => {
        socket.join(room);
        socket.emit('joined-room', room);
      });
    
      socket.on('message', (room, message) => {
        vm.chatChannel.of(room).emit({
          from: socket.user ? socket.user.identifier : '<anonymous>',
          message: message
        });
      });
      
    });
  }

  createChannel (clip) {
    const vm = this;
    return new Promise((resolve, reject) => {
      try {
        const ch = new StreamingChannel(shortid.generate());
        ch.clip = clip;

        vm.channels.push(ch);

        resolve(ch);
      } catch (e) {
        reject(e);
      }
      
    });
  }

  getStreamChannel (id) {
    const vm = this;
    return new Promise((resolve, reject) => {
      try {
        resolve(_.find(vm.channels, (item) => { return item.id === id; }))
      } catch (e) {
        reject(e);
      }
      
    });
  }
}

class StreamingChannel {
  constructor (id) {
    this._channelId = id;
  }

  get id () {
    return this._channelId;
  }
}

module.exports = Streaming;