var models = require('../models');
var notification = models.notification;
var User = require('../proxy').User;
var notificationProxy = require('../proxy/notification');
var mail = require('./mail');

exports.sendReplynotification = function (master_id, author_id, topic_id, reply_id) {
  var notification = new notification();
  notification.type = 'reply';
  notification.master_id = master_id;
  notification.author_id = author_id;
  notification.topic_id = topic_id;
  notification.reply_id = reply_id;
  notification.save(function (err) {
    // TODO: 异常处理
    User.getUserById(master_id, function (err, master) {
      // TODO: 异常处理
      if (master && master.receive_reply_mail) {
        notification.has_read = true;
        notification.save();
        notificationProxy.getnotificationById(notification._id, function (err, msg) {
          msg.reply_id = reply_id;
          // TODO: 异常处理
          mail.sendReplyMail(master.email, msg);
        });
      }
    });
  });
};

exports.sendReply2notification = function (master_id, author_id, topic_id, reply_id) {
  var notification = new notification();
  notification.type = 'reply2';
  notification.master_id = master_id;
  notification.author_id = author_id;
  notification.topic_id = topic_id;
  notification.reply_id = reply_id;
  notification.save(function (err) {
    // TODO: 异常处理
    User.getUserById(master_id, function (err, master) {
      // TODO: 异常处理
      if (master && master.receive_reply_mail) {
        notification.has_read = true;
        notification.save();
        notificationProxy.getnotificationById(notification._id, function (err, msg) {
          msg.reply_id = reply_id;
          // TODO: 异常处理
          mail.sendReplyMail(master.email, msg);
        });
      }
    });
  });
};

exports.sendAtnotification = function (master_id, author_id, topic_id, reply_id, callback) {
  var notification = new notification();
  notification.type = 'at';
  notification.master_id = master_id;
  notification.author_id = author_id;
  notification.topic_id = topic_id;
  notification.reply_id = reply_id;
  notification.save(function (err) {
    // TODO: 异常处理
    User.getUserById(master_id, function (err, master) {
      // TODO: 异常处理
      if (master && master.receive_at_mail) {
        notification.has_read = true;
        notification.save();
        notificationProxy.getnotificationById(notification._id, function (err, msg) {
          // TODO: 异常处理
          mail.sendAtMail(master.email, msg);
        });
      }
    });
    callback(err);
  });
};

exports.sendFollownotification = function (follow_id, author_id) {
  var notification = new notification();
  notification.type = 'follow';
  notification.master_id = follow_id;
  notification.author_id = author_id;
  notification.save();
};
