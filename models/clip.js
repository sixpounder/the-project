const shortid = require('shortid');
const path = require('path');

module.exports = (sequelize, DataTypes) => {
  const definition = sequelize.define('clip', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },

    description: {
      type: DataTypes.STRING,
      allowNull: true
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

    scopes: {
      converted: {
        where: {
          targetFd: { [sequelize.Op.not]: null }
        }
      }
    },

    hooks: {
      beforeValidate: (instance) => {
        if (! instance.uuid) {
          instance.uuid = shortid.generate();
        }
      }
    }
  });

  definition.prototype.isConverted = function () {
    return this.fd !== null && this.targetFd !== null;
  };

  definition.prototype.coversPath = function () {
    if (!this.isConverted()) {
      return null;
    }
    const dir = path.resolve(path.dirname(this.targetFd), 'screenshots');
    return dir;
  };

  definition.prototype.coverPath = function (i) {
    return path.resolve(this.coversPath(), `thumbnail-${i ? i : Math.floor(Math.random() * 3) + 1}.png`);
  };

  definition.prototype.toJSON = function() {
    const values = this.get();

    delete values.id;
    delete values.fd;
    delete values.targetFd;

    values.cover = `/api/content/clips/${values.uuid}/cover?i=1`;

    return values;
  };

  return definition;
};