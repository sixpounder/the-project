'use strict';

module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('passports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },

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
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },

      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    }, {
      charset: 'utf8'
    });
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('passports');
  }
};
