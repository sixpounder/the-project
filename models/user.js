module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user', {
    identifier: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
    charset: 'utf8'
  });
};