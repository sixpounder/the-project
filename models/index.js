const Sequelize   = require('sequelize');
const dbConfig    = require(resolveModule('config/database'));
const user        = require('./user');
const clip        = require('./clip');

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig.options);


// Models definitions imports
// Importa i due modelli qui
sequelize.import('user', user);
sequelize.import('clip', clip);

module.exports = sequelize;