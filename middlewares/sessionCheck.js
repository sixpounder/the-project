const sequelize = require(resolveModule('models'));
const log = require('../lib/log');

module.exports = (req, res, next) => {
  if (req.session.userId) {
    sequelize.models.user.findOne({ where: { id: req.session.userId }}).then(user => {
      req.user = user;
      next();
    }).catch(err => {
      log.error(err);
      next();
    });
  } else {
    next();
  }
};