const conf = require(resolveModule('config/cors')); 
const _ = require('lodash');

module.exports = function(req, res, next) {
  
  res.header('Access-Control-Allow-Credentials', true);

  // origin can not be '*' when crendentials are enabled. so need to set it to the request origin (if whitelisted)
  res.header('Access-Control-Allow-Origin', _.indexOf(conf.whitelist, req.headers.origin) !== -1 ? req.headers.origin : null);

  // list of methods that are supported by the server
  res.header('Access-Control-Allow-Methods', conf.allowedMethods);

  res.header('Access-Control-Allow-Headers', conf.allowedHeaders);

  next();
};