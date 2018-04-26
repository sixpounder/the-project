module.exports = (sequelize, DataTypes) => {
  return sequelize.define('clip', {
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  });
};