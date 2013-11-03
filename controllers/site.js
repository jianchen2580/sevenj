var User = require('../proxy').User

exports.index = function (req, res, next) {
  var page = parseInt(req.query.page, 10) || 1;
  var kwyword = req.query.q || '';
  res.render('forum/index', {
  });
};
