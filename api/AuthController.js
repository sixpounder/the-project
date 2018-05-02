const sequelize = require(resolveModule('models'));
const bcrypt = require('bcrypt');
const log = require('../lib/log');

const saltRounds = 10;

module.exports = {
  signup: (req, res) => {
    const data = req.body;

    bcrypt.genSalt(saltRounds, function(err, salt) {
      if(err) {
        log.error(err);
        res.status(500);
        return res.json({ reason: 'Something has blown up' });
      } else {
        bcrypt.hash(data.password, salt, function(err, hash) {
          if(err) {
            log.error(err);
            res.status(500);
            return res.json({ reason: 'Something has blown up' });
          } else {
            sequelize.transaction((t) => {
              sequelize.models.User.create({ email: data.email }, { transaction: t }).then((user) => {
                return user.addPassport({ password: hash, provider: 'local' }, { transaction: t }).then(() => {
                  return user;
                });
              });
            }).then((user) => {
              res.json(user);
            }).catch(err => {
              log.error(err);
              res.status(500);
              return res.json({ reason: 'Something has blown up' });
            });
          }
        });
      }
    });
  }
};