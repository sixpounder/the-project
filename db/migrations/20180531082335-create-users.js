'use strict';

module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      
      identifier: {
        type: DataTypes.STRING,
        allowNull: false
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false
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
    return queryInterface.dropTable('users');
  }
};
