const shortid = require('shortid');

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('clip', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uuid: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fd: {
      type: DataTypes.STRING,
      allowNull: false
    },

    filename: {
      type: DataTypes.STRING,
      allowNull: false
    },

    mimetype: {
      type: DataTypes.STRING
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