const shortid = require('shortid');

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('clip', {
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    uuid: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    charset: 'utf8',

    hooks: {
      beforeValidate: (instance) => {
        if (! instance.uuid) {
          instance.uuid = shortid.generate();
        }
      }
    }
  });
};