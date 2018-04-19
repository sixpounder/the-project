module.exports = (req, res, next) => {
  req.session.homeCount = req.session.homeCount ? req.session.homeCount + 1 : 1;
  next();
};