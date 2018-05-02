module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user', {
    identifier: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  });
};