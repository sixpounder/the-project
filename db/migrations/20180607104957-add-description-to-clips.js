'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('clips', 'description', { type: Sequelize.STRING });
  },

  down: () => {
  }
};
