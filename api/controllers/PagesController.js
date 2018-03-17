module.exports = {
  /**
   * Handles a "not found" request
   */
  notFoundHandler: function(req, res, next) {
    res.status(404);
    res.render('404');
  }
};