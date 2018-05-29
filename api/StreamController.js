const sequelize = require(resolveModule('models'));
const _         = require('lodash');
const fs        = require('fs');
const chokidar  = require('chokidar');
const path      = require('path');
const log       = require('../lib/log');
const url       = require('url');
const conf      = require(resolveModule('config/uploads'));

const PLAYLIST_MIMETYPE = 'application/vnd.apple.mpegurl';
const TS_MIMETYPE = 'video/MP2T';

module.exports = {
  create: (req, res) => {
    sequelize.models.clip.findOne({ where: { uuid: req.params.id }}).then(clip => {
      if (clip) {
        const newChannel = req.streamingManager.addChannel(clip);
        log.info('Created channel ' + newChannel.id);
        res.json({ streamId: newChannel.id });
      } else {
        res.status(404).json({ reason: 'E_NOCLIP' });
      }
    });
    
  },

  streamChunk: (req, res) => {
    const filename = _.last(url.parse(req.url).pathname.split('/'));
    const chunkPath = path.resolve(conf.convertedPath, req.params.id, req.params.stream, filename);
    res.set('Content-Type', TS_MIMETYPE);
    log.info('Serving ' + chunkPath);
    const stream = fs.createReadStream(chunkPath);
    stream.pipe(res);
  },

  streamManifest: (req, res) => {
    const filename = `${req.params.manifest}.m3u8`;
    const manifestDir = path.resolve(conf.convertedPath, req.params.id, req.params.stream);
    const manifestPath = path.resolve(manifestDir, filename);

    chokidar.watch(manifestDir).on('add', (who) => {
      if (who === manifestPath) {
        fs.access(manifestPath, fs.constants.R_OK, (err) => {
          if (err) {
            log.error(err);
            res.status(500).json({ reason: 'E_NOMANIFEST' });
          } else {
            res.set('Content-Type', PLAYLIST_MIMETYPE);
            const manifestFile = fs.createReadStream(manifestPath);
            manifestFile.pipe(res);
          }
        });
      }
    });
  }
};