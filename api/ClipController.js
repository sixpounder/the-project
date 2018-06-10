const path        = require('path');
const fs          = require('fs');
const { Op }      = require('sequelize');
// const shortid     = require('shortid');
const _           = require('lodash');
const mkdirp      = require('mkdirp');
const sequelize   = require(resolveModule('models'));
const convert     = require(resolveModule('lib/converter'));
const screenshots = require(resolveModule('lib/screenshots'));
const log         = require(resolveModule('lib/log'));
const conf        = require(resolveModule('config/uploads'));

module.exports = {
  create: (req, res) => {
    const fileData = req.files.length === 0 ? null : req.files[0];
    const metadata = req.body;
    sequelize.models.clip.create({
      title: metadata.title,
      fd: fileData.fd, // <-- fd stands for "file descriptor"
      filename: fileData.filename,
      mimetype: fileData.mimetype,
      uploaderId: req.user.id
    }).then(clip => {
      const createdClip = _.cloneDeep(clip);

      // Start conversion
      process.nextTick(function () {
        const generatedClipUUID = clip.uuid;
        const outdir = path.resolve(conf.convertedPath, generatedClipUUID);
        mkdirp(outdir, (err) => {
          if (err) {
            log.error('Could not create ' + outdir);
            log.error(err);
          } else {
            return convert(createdClip.fd, outdir).then(outputPath => {
              createdClip.targetFd = outputPath;
              return createdClip.save();
            }).then(converted => {
              log.info('Done converting clip with id ' + converted.id);
              return screenshots(createdClip.fd, path.resolve(outdir, 'screenshots'));
            }).then(() => {
              log.info('Done generating screenshots');
            }).catch(err => {
              log.error(err);
            });
          }
        });
      });

      res.json(clip);
    });
  },

  cover: (req, res) => {
    sequelize.models.clip.findOne({
      where: {
        [ Op.or ]: [
          { id: req.params.id },
          { uuid: req.params.id }
        ] 
      },
    }).then(clip => {
      if (!clip) {
        res.status(404).end();
      } else {
        const tIndex = req.query.i || Math.floor(Math.random() * 3) + 1;
        fs.stat(path.resolve(clip.coversPath(), `thumbnail-${tIndex}.png`), (err) => {
          res.set('Content-Type', 'image/png');
          if (err) {
            // Send a default cover
            fs.createReadStream(path.resolve('assets', 'vph.png')).pipe(res);
          } else {
            const rs = fs.createReadStream(path.resolve(clip.coversPath(), `thumbnail-${tIndex}.png`));
            rs.pipe(res).on('error', (err) => {
              log.error(err);
            });
          }
        });
        
      }
    }).catch(err => {
      log.error(err);
    });
  },

  find: (req, res) => {
    const scope = req.params.scope || 'latest';
    const page = req.query.page || 0;

    if (scope === 'latest') {
      sequelize.models.clip.scope('converted').findAll({
        include: ['uploader'],
        limit: 30,
        offset: 30 * page,
        order: [['createdAt', 'DESC']]
      }).then(clips => {
        res.json(clips);
      }).catch(err => {
        log.error(err);
        res.status(500).json({ reason: 'E_SEARCH' });
      });
    }
  },

  findOne: (req, res) => {
    sequelize.models.clip.findOne({
      where: {
        [ Op.or ]: [
          { id: req.params.id },
          { uuid: req.params.id }
        ] 
      },
      include: ['uploader']
    }).then(clip => {
      if (clip.isReady()) {
        res.json(clip);
      } else {
        res.status(202).json({ status: 'converting' });
      }
    });
  }
};