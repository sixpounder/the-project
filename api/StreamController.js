const sequelize = require(resolveModule('models'));
const _         = require('lodash');
const fs        = require('fs');
const path      = require('path');
const log       = require('../lib/log');
const url       = require('url');
const zlib      = require('zlib');
const streaming = require(resolveModule('lib/streaming'));
const conf      = require(resolveModule('config/uploads'));

const PLAYLIST_MIMETYPE = 'application/vnd.apple.mpegurl';
const TS_MIMETYPE = 'video/MP2T';

module.exports = {
  create: (req, res) => {
    sequelize.models.clip.findOne({ where: { uuid: req.params.id }}).then(clip => {
      if (clip) {
        const newChannel = streaming.addChannel(clip);
        log.info('Created channel ' + newChannel.id);
        res.json({ streamId: newChannel.id });
      } else {
        res.status(404).json({ reason: 'E_NOCLIP' });
      }
    });
    
  },

  streamChunk: (req, res) => {
    sequelize.models.clip.findOne({ where: { uuid: req.params.id }}).then(clip => {
      if (!clip) {
        res.status(404).end();
      } else if (! clip.isReady()) {
        res.status(202).json({ status: 'converting' });
      } else {
        const filename = _.last(url.parse(req.url).pathname.split('/'));
        res.set('Content-Type', TS_MIMETYPE);
        const chunkPath = path.resolve(conf.convertedPath, clip.uuid, filename);
        log.info('Serving ' + chunkPath);
        const stream = fs.createReadStream(chunkPath);
        stream.pipe(res);
      }
    });
  },

  streamManifest: (req, res) => {
    sequelize.models.clip.findOne({ where: { uuid: req.params.id }}).then(clip => {
      if (!clip) {
        res.status(404).end();
      } else if (! clip.isReady()) {
        res.status(202).json({ status: 'converting' });
      } else {
        // const uri = url.parse(req.url).pathname;
        fs.readFile(clip.fd, (err, contents) => {
          if (err) {
            return res.status(500).json({ reason: 'E_READ' });
          }

          res.set('Content-Type', PLAYLIST_MIMETYPE);
          if (req.headers['accept-encoding'] && req.headers['accept-encoding'].match(/\bgzip\b/)) {
            zlib.gzip(contents, (err, zip) => {
              if (err) {
                return res.status(500).json({ reason: 'E_COMPRESS' });
              }

              res.set('Content-Encoding', 'gzip');
              res.status(200).end(zip);
            });
          } else {
            res.status(200).end(contents, 'utf-8');
          }
        });
      }
    }).catch(err => {
      log.error(err);
      return res.status(500).json({ reason: 'E_STREAM_GENERIC' });
    });
  },
  // streamManifest: (req, res) => {
  //   try {
  //     res.set('Content-Type', PLAYLIST_MIMETYPE).status(200).write(streaming.getChannel(req.params.id).manifest);
  //   } catch (e) {
  //     log.error(e);
  //     res.status(404).end();
  //   }
  // },

  manifestEndpoint: (req, res) => {
    const manifestBuffer = req.files.length ? req.files[0] : null;

    if (manifestBuffer) {
      const streamId = req.params.id;
      streaming.updateManifestForChannel(streamId);
    } else {
      res.status(406).end();
    }
  }
};