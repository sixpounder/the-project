module.exports = {
  /**
   * Handles a "not found" request
   */
  notFoundHandler: function(req, res) {
    res.status(404);
    res.render('404');
  },
  
  home: function(req, res) {
    res.render('index');
  }
};