const path        = require('path');

global.resolveModule = function(...args) {
  return path.resolve(__dirname, ...args);
};

const httpConfig  = require('./config/http');
const server      = require('./server');
const sequelize   = require('./models');


console.info('Starting app...');

sequelize.authenticate().then(() => {
  
  
  const connection = new Sequelize({
    database: 'db_name',
    username: 'username',
    password: null,
    dialect: 'mysql'
  });

  const Film = connection.define("film",{
    titolo: Sequelize.STRING
    regista: Sequelize.STRING
  });
  connection.sync();
  console.log(film);
 
  // DB Connection ok

  // TODO: Sincronizza il db
  // ...
}).then(() => {
  return server.listen(httpConfig.port);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

}