module.exports = (sequelize, DataTypes) => {
  return sequelize.define('passport', {
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    provider: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'local'
    },

    token: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    charset: 'utf8'
  });
};