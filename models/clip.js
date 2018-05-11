module.exports = (sequelize, DataTypes) => {
  return sequelize.define('clip', {
    title: {
      type: DataTypes.STRING,
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
    charset: 'utf8'
  });
};