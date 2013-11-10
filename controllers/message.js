var sanitize = require('validator').sanitize;

var Topic = require('../proxy').Topic;
var TagCollect = require('../proxy').TagCollect;
var Tag = require('../proxy').Tag;
var TopicTag = require('../proxy').TopicTag;
var User = require('../proxy').User;

var config = require('../config').config;
var EventProxy = require('eventproxy');

exports.index = function (req, res) {
  var page = parseInt(req.query.page, 10) || 1;
  var user_id = parseInt(req.query.user_id, 10);
  var action = req.query.action || null;
  var category = req.query.category || 'all';
  var current_user = req.session.user;
  if (user_id) {
    User.getUserById(user_id, function (err, user) {
      if(err) {
        return;
      }
      current_user.getMessageBox(user._id, function (err, message_box) {
        if (action == 'read') {
          message_box.has_read = true;
          //TODO: add return
          return;
        }
        if (message_box.length == 0) {
          //TODO: add return
          return;
        }
        res.render('message/message', {
          user: user,
          message_box: message_box,
          page: page
          });
      });
    });
  }
  res.render('message/message_box', {
    category: category,
    page: page
  });
/*
  Tag.getTagByUrlName(tag_urlname, function (err, tag) {
    res.render('forum/tag_index', {
      tag: tag
    });
  });
  */
}


