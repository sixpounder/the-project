const sequelize = require('../models');

module.exports = (socket, next) => {
  if (socket.request.session.id) {
    sequelize.models.user.findOne({ where: { id: socket.request.session.id }}).then(user => {
      socket.user = user;
      next();
    }).catch(next);
  } else {
    next();
  }
};