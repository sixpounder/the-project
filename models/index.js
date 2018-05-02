const Sequelize   = require('sequelize');
const dbConfig    = require(resolveModule('config/database'));
const user        = require('./user');
const clip        = require('./clip');
const passport    = require('./passport');

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig.options);


// Models definitions imports
// Importa i due modelli qui
const User = sequelize.import('user', user);
const Clip = sequelize.import('clip', clip);
const Passport = sequelize.import('passport', passport);

// Setup associations
User.hasMany(Clip, { foreignKey: 'uploaderId' });
Clip.belongsTo(User, { foreignKey: 'uploaderId' });

User.hasMany(Passport);
Passport.belongsTo(User);

module.exports = sequelize;