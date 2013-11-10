var EventProxy = require('eventproxy');

var Notification = require('../models').Notification;

var User = require('./user');
var Topic = require('./topic');
var Reply = require('./reply');

/**
 * 根据用户ID，获取未读消息的数量
 * Callback:
 * 回调函数参数列表：
 * - err, 数据库错误
 * - count, 未读消息数量
 * @param {String} id 用户ID
 * @param {Function} callback 获取消息数量
 */
exports.getNotificationsCount = function (id, callback) {
  Notification.count({master_id: id, has_read: false}, callback);
};


/**
 * 根据消息Id获取消息
 * Callback:
 * - err, 数据库错误
 * - notification, 消息对象
 * @param {String} id 消息ID
 * @param {Function} callback 回调函数
 */
exports.getNotificationById = function (id, callback) {
  Notification.findOne({_id: id}, function (err, notification) {
    if (err) {
      return callback(err);
    }
    if (notification.type === 'reply' || notification.type === 'reply2' || notification.type === 'at') {
      var proxy = new EventProxy();
      proxy.assign('author_found', 'topic_found', 'reply_found', function (author, topic, reply) {
        notification.author = author;
        notification.topic = topic;
        notification.reply = reply;
        if (!author || !topic) {
          notification.is_invalid = true;
        }
        return callback(null, notification);
      }).fail(callback); // 接收异常
      User.getUserById(notification.author_id, proxy.done('author_found'));
      Topic.getTopicById(notification.topic_id, proxy.done('topic_found'));
      Reply.getReplyById(notification.reply_id, proxy.done('reply_found'));
    }

    if (notification.type === 'follow') {
      User.getUserById(notification.author_id, function (err, author) {
        if (err) {
          return callback(err);
        }
        notification.author = author;
        if (!author) {
          notification.is_invalid = true;
        }
        return callback(null, notification);
      });
    }
  });
};

/**
 * 根据用户ID，获取消息列表
 * Callback:
 * - err, 数据库异常
 * - notifications, 消息列表
 * @param {String} userId 用户ID
 * @param {Function} callback 回调函数
 */
exports.getNotificationsByUserId = function (userId, callback) {
  Notification.find({master_id: userId}, [], {sort: [['create_at', 'desc']], limit: 20}, callback);
};

/**
 * 根据用户ID，获取未读消息列表
 * Callback:
 * - err, 数据库异常
 * - notifications, 未读消息列表
 * @param {String} userId 用户ID
 * @param {Function} callback 回调函数
 */
exports.getUnreadNotificationByUserId = function (userId, callback) {
  Notification.find({master_id: userId, has_read: false}, callback);
};
