module.exports = {
  proxy: (req, res) => {
    req.pipe(res);
  }
};