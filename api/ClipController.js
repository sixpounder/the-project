const path        = require('path');
const { Op }      = require('sequelize');
const shortid     = require('shortid');
const _           = require('lodash');
const sequelize   = require(resolveModule('models'));
const convert     = require(resolveModule('lib/converter'));
const log         = require(resolveModule('lib/log'));
const conf        = require(resolveModule('config/uploads'));

module.exports = {
  create: (req, res) => {
    const fileData = req.files.length === 0 ? null : req.files[0];
    const metadata = req.body;
    sequelize.models.clip.create({
      title: metadata.title,
      fd: fileData.fd,
      targetFd: null,
      filename: fileData.filename,
      mimetype: fileData.mimetype,
      uploaderId: req.user.id
    }).then(clip => {
      const createdClip = _.cloneDeep(clip);
      res.json(clip);

      // Start conversion...
      process.nextTick(function () {
        return convert(createdClip.fd, path.resolve(conf.convertedPath, `${shortid.generate()}.webm`)).then(outputPath => {
          createdClip.targetFd = outputPath;
          return createdClip.save();
        }).then(converted => {
          log.info('Done converting clip with id ' + converted.id);
        }).catch(err => {
          log.error(err);
        });
      });
    });
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