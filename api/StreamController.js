const sequelize = require(resolveModule('models'));
const { Streaming } = require(resolveModule('lib/streaming'));
const log = require('../lib/log');

module.exports = {
  /**
   * Starts a new stream on a given clip
   */
  // stream: (req, res) => {
  //   let theClip;
    
  //   const range = req.headers.range;

  //   let fileSize, start, end, parts, chunksize;

  //   sequelize.models.clip.findOne({ where: { uuid: req.params.id }, include: ['uploader']}).then((clip) => {
  //     theClip = clip;
  //     return stat(clip.fd);
  //   }).then(stats => {
  //     fileSize = stats.size;

  //     if (range) {
  //       parts = range.replace(/bytes=/, '').split('-');
  //       start = parseInt(parts[0], 10);
  //       end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  //       chunksize = (end - start) + 1;

  //       const file = fs.createReadStream(theClip.fd, { start, end });
  //       const head = {
  //         'Content-Range': `bytes ${start}-${end}/${fileSize}`,
  //         'Accept-Ranges': 'bytes',
  //         'Content-Length': chunksize,
  //         'Content-Type': 'video/mp4',
  //       };

  //       res.writeHead(206, head);
  //       file.pipe(res);
  //     } else {
  //       const head = {
  //         'Content-Length': fileSize,
  //         'Content-Type': 'video/mp4',
  //       };
  //       res.writeHead(200, head);
  //       fs.createReadStream(theClip.fd).pipe(res);
  //     }
  //   });
  // },

  stream: (req, res) => {
    const clipUUID = req.params.id;
    const streamId = req.params.stream || req.query.stream;

    if (streamId) {
      Streaming.getStreamChannel(req.params.stream).then(channel => {
        if (channel) {
          res.json(channel);
        } else {
          res.status(404).json({ reason: 'E_NOCHANNEL '});
        }
      });
    } else {
      sequelize.models.clip.findOne({ where: { uuid: clipUUID }, include: ['uploader']}).then((clip) => {
        Streaming.createChannel(clip).then(channel => {
          res.json(channel);
        }).catch(err => {
          log.error(err);
          res.status(500).json({ reason: 'E_CHCR' });
        });
      });
    }
  },

  /**
   * Connects to a clip stream. If no stream exists, it creates one
   */
  connect: (req, res) => {
    const streamIdentifier = req.params.streamIdentifier;

    const channel = Streaming.getStreamChannel(streamIdentifier);

    if (channel) {
      res.json({ channel: channel.id, currentPosition: channel.position });
    } else {
      res.status(404).json({ reason: 'E_NOCHANNEL' });
    }
  }
};