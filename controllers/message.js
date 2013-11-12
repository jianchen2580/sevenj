var sanitize = require('validator').sanitize;

var User = require('../proxy').User;
var Message = require('../proxy').Message

var config = require('../config').config;
var EventProxy = require('eventproxy');

exports.index = function (req, res) {
  var page = parseInt(req.query.page, 10) || 1;
  var user_id = parseInt(req.query.user_id, 10);
  var action = req.query.action || null;
  var category = req.query.category || 'all';
  var current_user = req.session.user;
  if (current_user) {
    User.getUserById(user_id, function (err, user) {
      if(err) {
        return;
      }
      current_user.getMessageBox(user._id, function (err, message_boxes) {
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
          message_boxes: message_boxes,
          page: page
          });
      });
    });
  }
  Message.getMessageBoxes(current_user._id, function (err, message_boxes) {
    res.render('message/message_box', {
      message_boxes: message_boxes,
      page: page
      });
  });
}

exports.create = function (req, res, next) {
  var user_id = req.query.user_id;
  var content = req.body.content;
  var sender = req.session.user;

  if (user_id) {
    User.getUserById(user_id, function (err, user) {
      if(err) {
        return;
      }
      Message.newAndSave(sender._id, user._id, content, function (err, message) {
        if (err) {
        }
        var result = {"status": "success",
                      "message": "私信发送成功",
                      "content": message.content,
                      "created": message.create_at,
                      "avatar": sender.avatar_url,
                      "url": sender.url,
                      "id": message._id
        }
        res.contentType('json');
        res.send(result);
      });
    });
  }
};
