const _ = require('lodash');
const sequelize = require('../models');

module.exports = function(req, res, next) {

  // if data are valid (password is set and email is set and email doesn't exist on db), send bad request response. Else, next().
  if (!req.body.password || (_.isString(req.body.password && _.isEmpty(req.body.password)))) {
    return res.status(406).json({ reason: 'E_NO_PASSWORD' });
  }

  if (!req.body.email || (_.isString(req.body.email && _.isEmpty(req.body.email)))) {
    return res.status(406).json({ reason: 'E_NO_PASSWORD' });
  }

  sequelize.models.user.findOne({ email: req.body.email }).then(result => {
    if(!result) {
      return next();
    } else {
      return res.status(406).json({ reason: 'E_EMAIL_EXISTS' });
    }
  });
};