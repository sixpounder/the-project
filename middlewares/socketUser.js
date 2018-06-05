const sequelize = require('../models');

module.exports = (socket, next) => {
  if (socket.request.session && socket.request.session.userId) {
    sequelize.models.user.findOne({ where: { id: socket.request.session.userId }}).then(user => {
      socket.user = user;
      next();
    }).catch(next);
  } else {
    next();
  }
};