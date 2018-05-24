const log = require('./log');
const shortid = require('shortid');
const _ = require('lodash');
const { EventEmitter } = require('events');
const sequelize = require('../models');

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
    
    
    this.chatChannel.clientsInRoom = function(roomName) {
      const clients = this.adapter.rooms[roomName].sockets;   

      //to get the number of clients
      // const numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;
      // for (var clientId in clients ) {
      //   //this is the socket of each client in the room.
      //   var clientSocket = this.sockets.connected[clientId];

      //   //you can do whatever you need with this
      //   clientSocket.emit('new event', "Updates");
      // }

      return clients;
    },

    this.chatChannel.use(function(socket, next) {
      if (socket.request.session.userId) {
        sequelize.models.user.findOne({ where: { id: socket.request.session.userId }}).then(user => {
          if (user) {
            socket.request.session.user = user;
            next();
          } else {
            next (new Error('E_NOSESS'));    
          }
        });
      } else {
        next (new Error('E_NOSESS'));
      }
    });

    this.chatChannel.on('connection', (socket) => {
      log.info('A client connected to chat socket');
    
      socket.on('join-room', (room, fn) => {
        log.debug('Client joining chat room ' + room);
        socket.join(room);
        fn(vm.chatChannel.clientsInRoom(room));
      });

      socket.on('leave-room', (room, fn) => {
        socket.leave(room);
        fn(room);
      });
    
      socket.on('message', (room, message) => {
        vm.chatChannel.to(room).emit('message', {
          from: socket.request.session.user ? socket.request.session.user.identifier : '<anonymous>',
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
        resolve(_.find(vm.channels, (item) => { return item.id === id; }));
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

  get master () {
    return this._master;
  }

  set master (value) {
    this._master = value;
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