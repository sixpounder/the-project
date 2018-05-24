const log = require('./log');
const shortid = require('shortid');
const _ = require('lodash');
const { EventEmitter } = require('events');

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
        let isMaster = false;
        
        vm.getStreamChannel(room).then(ch => {
          if (ch) {
            if (ch.clients.length === 0) {
              isMaster = true;
            }
            ch.addClient(socket);
            socket.join(room);
            socket.emit('joined-stream-room', room, isMaster);

          } else {
            socket.emit('no-room', room);
          }
        }).catch(e => {
          log.error(e);
          socket.emit('no-room', room);
        });
      });

      socket.on('leave-stream-room', (room) => {
        vm.getStreamChannel(room).then(ch => {
          if (ch) {
            socket.leave(room);
            ch.removeClient(socket);
          }
        });
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
        
        ch.on('changed-master', masterSocket => {
          masterSocket.emit('becomes-master', ch.id);
        });

        ch.on('client-left', (client) => {
          vm.chatChannel.to(ch.id).emit('client-left', client.user.identifier);
        });

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

class StreamingChannel extends EventEmitter {
  constructor (id) {
    super();

    this._channelId = id;
    this.clients = [];
    this.clip = null;

    this.master = null;
  }

  addClient (c) {
    if (this.clients.length === 0) {
      this.emit('changed-master', c);
      this.master = c;
    }

    this.clients.push(c);
  }

  removeClient (c) {
    _.remove(this.clients, c);
    if (this.master === c) {
      if (this.clients.length !== 0) {
        this.master = this.clients[0];
      }
    }
  }

  clients () {
    return this.clients;
  }

  get id () {
    return this._channelId;
  }

  set master (value) {
    this.master = value;
    this.emit('changed-master', this.master);
  }

  toJSON () {
    return {
      _channelId: this.id,
      clients: this.clients.length
    };
  }
}

module.exports = Streaming;