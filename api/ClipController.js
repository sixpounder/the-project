const sequelize = require(resolveModule('models'));

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
  }
};