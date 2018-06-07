'use strict';

module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('clips', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false
      },

      uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        index: true
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
      },

      uploaderId: {
        type: DataTypes.INTEGER,
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
    return queryInterface.dropTable('clips');
  }
};
