const sequelize = require(resolveModule('models'));
const bcrypt = require('bcrypt');
const log = require('../lib/log');

const saltRounds = 10;

module.exports = {
  checkEmail: (req, res) => {
    sequelize.models.user.findOne({ email: req.query.email }).then(user => {
      if(user) {
        return res.json({ exists: true });
      } else {
        return res.json({ exists: false });
      }
    }).catch(err => {
      log.error(err);
      res.status(500).json({ reason: 'An error has occurred' });
    });
  },

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
            sequelize.transaction(function (t) {
              let createdUser;
              return sequelize.models.user.create({ email: data.email, identifier: data.identifier }, { transaction: t })
                .then((user) => {
                  createdUser = user;
                  return sequelize.models.passport.create({ password: hash, provider: 'local' }, { transaction: t });
                })
                .then((passport) => {
                  return createdUser.addPassport(passport, { transaction: t });
                }).then(() => {
                  return createdUser;
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