const sequelize = require(resolveModule('models'));
const bcrypt = require('bcrypt');
const log = require('../lib/log');

const saltRounds = 10;

module.exports = {
  checkEmail: (req, res) => {
    sequelize.models.user.findOne({ where: { email: req.query.email }}).then(user => {
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
  },

  logout: (req, res) => {
    if (req.session.userId) {
      req.session.userId = null;
    }

    return res.status(200).end();
  },

  login: (req, res) => {
    const email = req.body.email;
    const psw = req.body.password;

    sequelize.models.user.findOne({
      where: { email: email }, 
      include: [{
        model: sequelize.models.passport,
        where: { provider: 'local' },
        limit: 1
      }]
    }).then(user => {
      if(!user) {
        return res.status(404).json({ reason: 'E_NOTFOUND' });
      } else {
        const storedPassport = user.passports[0];
        bcrypt.compare(psw, storedPassport.password, function(err, match) {
          if (match) {
            req.session.userId = user.id;
            delete user.passports;
            res.json(user);
          } else {
            return res.status(406).json({ reason: 'E_PSW_WRONG' });
          }
        });
      }
    }).catch(err => {
      log.error(err);
      res.status(500).json({ reason: 'E_GENERIC' });
    });
  },

  me: (req, res) => {
    res.json({ user: req.user || null });
  }
};