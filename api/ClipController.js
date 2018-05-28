// const path        = require('path');
const { Op }      = require('sequelize');
// const shortid     = require('shortid');
// const _           = require('lodash');
// const mkdirp      = require('mkdirp');
const sequelize   = require(resolveModule('models'));
// const convert     = require(resolveModule('lib/converter'));
// const log         = require(resolveModule('lib/log'));
// const conf        = require(resolveModule('config/uploads'));

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
      // const createdClip = _.cloneDeep(clip);

      // Start conversion
      // process.nextTick(function () {
      //   const generatedClipUUID = clip.uuid;
      //   const outdir = path.resolve(conf.convertedPath, generatedClipUUID);
      //   mkdirp(outdir, (err) => {
      //     if (err) {
      //       log.error('Could not create ' + outdir);
      //       log.error(err);
      //     } else {
      //       return convert(createdClip.fd, outdir).then(outputPath => {
      //         createdClip.targetFd = outputPath;
      //         return createdClip.save();
      //       }).then(converted => {
      //         log.info('Done converting clip with id ' + converted.id);
      //       }).catch(err => {
      //         log.error(err);
      //       });
      //     }
      //   });
      // });

      res.json(clip);
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