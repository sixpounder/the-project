module.exports = (sequelize, DataTypes) => {
  return sequelize.define('passport', {
    identifier: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    password: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    provider: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'local'
    },

    token: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });
};