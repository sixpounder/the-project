const sequelize = require(resolveModule('models'));
const { Op } = require('sequelize');

module.exports = {
  create: (req, res) => {
    const fileData = req.files.length === 0 ? null : req.files[0];
    const metadata = req.body;
    sequelize.models.clip.create({
      title: metadata.title,
      fd: fileData.fd,
      filename: fileData.filename,
      mimetype: fileData.mimetype,
      uploaderId: req.user.id
    }).then(clip => {
      res.json(clip);
    });
  },

  findOne: (req, res) => {
    sequelize.models.clip.findOne({
      where: {
        [ Op.or ]: [
          {id: req.params.id},
          {uuid: req.params.id}
        ] 
      }
    }).then(clip => {
      res.json(clip);
    });
  }
};