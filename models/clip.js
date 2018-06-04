const shortid = require('shortid');

module.exports = (sequelize, DataTypes) => {
  const definition = sequelize.define('clip', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uuid: {
      type: DataTypes.STRING,
      allowNull: false
    },

    fd: {
      type: DataTypes.STRING,
      allowNull: false
    },

    targetFd: {
      type: DataTypes.STRING,
      allowNull: true
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

  definition.prototype.isConverted = function() {
    return this.fd !== null && this.targetFd !== null;
  };

  definition.prototype.toJSON = function() {
    const values = this.get();

    delete values.fd;
    delete values.convertedFd;

    return values;
  };

  return definition;
};