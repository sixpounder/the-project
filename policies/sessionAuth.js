module.exports = (req, res, next) => {
  if(req.session.userId) {
    next();
  } else {
    res.status(403).json({ reason: 'E_NOSESS' });
  }
};