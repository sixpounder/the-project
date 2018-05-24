const sequelize = require(resolveModule('models'));
const fs        = require('fs');
const shortid   = require('shortid');
const path      = require('path');
const log       = require('../lib/log');
const url       = require('url');
const zlib      = require('zlib');

// const stat = function(f) {
//   return new Promise((resolve, reject) => {
//     fs.stat(f, (err, stats) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(stats);
//       }
//     });
//   });
// };

module.exports = {
  create: (req, res) => {
    const newStreamId = shortid.generate();
    res.json({ streamId: newStreamId });
  },

  stream: (req, res) => {
    sequelize.models.clip.findOne({ where: { uuid: req.params.id }}).then(clip => {
      if (!clip) {
        res.status(404).end();
      } else {
        const uri = url.parse(req.url).pathname;
        const ext = path.extname(uri).toLowerCase();
        if (ext === '.m3u8') {
          fs.readFile(clip.targetFd, (err, contents) => {
            if (err) {
              return res.status(500).json({ reason: 'E_READ' });
            }

            res.set('Content-Type', 'application/vnd.apple.mpegurl');
            if (req.headers['accept-encoding'] && req.headers['accept-encoding'].match(/\bgzip\b/)) {
              zlib.gzip(contents, (err, zip) => {
                if (err) {
                  return res.status(500).json({ reason: 'E_COMPRESS' });
                }

                res.set('Content-Encoding', 'gzip');
                res.status(200).end(zip);
              });
            }
          });
          
        } else if (ext === '.ts') {
          res.set('Content-Type', 'video/MP2T');
          const stream = fs.createReadStream();
          stream.pipe(res);
        } else {
          res.status(406).json({ reason: 'E_BADPROTOCOL '});
        }
      }
    }).catch(err => {
      log.error(err);
      return res.status(500).json({ reason: 'E_STREAM_GENERIC' });
    });
  }
};