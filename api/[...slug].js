const handler = require('./index.js');

module.exports = (req, res) => {
  let subpath = '';
  if (req.query && req.query.slug) {
    subpath = Array.isArray(req.query.slug) ? req.query.slug.join('/') : req.query.slug;
  }
  return handler(req, res, subpath);
};
