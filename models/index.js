const Sequelize   = require('sequelize');
const dbConfig    = require(resolveModule('config/database'));

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig.options);


// Models definitions imports
// Importa i due modelli qui

module.exports = sequelize;