var EventProxy = require('eventproxy');
var Message = require('../models').Message;
var MessageBox = require('../models').MessageBox;

var User = require('./user');

exports.getMessageBoxes = function (sender_id, callback) {
  User.getUserById(sender_id);
  MessageBox.find({sender_id: sender_id}, function(err, messageBoxes) {
    var message_box_receiver_ids = [];
    var message_boxes = [];
    for (var i = 0; i < messageBoxes.length; i++) {
      message_box_receiver_ids.push(messageBoxes[i].receiver_id);
    }

    var ep = new EventProxy();
    ep.after('message_boxes_ready', message_box_receiver_ids.length, function(message_boxes) {
      return callback(null, message_boxes);
    });

    message_box_receiver_ids.forEach(function (id, i) {
      exports.getOrCreateMessageBox(sender_id, id, function(err, message_box) {
        ep.emit('message_boxes_ready', message_box);
      })
    })
    return callback(null, message_boxes);
  });
}

exports.getOrCreateMessageBox = function (sender_id, receiver_id, callback) {
  MessageBox.findOne({sender_id: sender_id, receiver_id: receiver_id}, function (err, message_box) {
    if (err) {
      return;
    }

    if (message_box) {
      User.getUserById(receiver_id, function (err, receiver) {
        message_box.receiver = receiver;
        return callback(null, message_box);
      });
    } else {
      var message_box = new MessageBox();
      message_box.sender_id = sender_id;
      message_box.receiver_id = receiver_id;

      message_box.save(function(err, message_box) {
        return callback(null, message_box);
      });
    }
  });
};

exports.newAndSaveMessage = function (sender_id, receiver_id, content, callback) {
  var ep = EventProxy.create('message_box1', 'message_box2', function (message_box1, message_box2) {
    var message = new Message();
    message.message_box1_id = message_box1._id;
    message.message_box2_id = message_box2._id;
    message.content = content;
    message.save(callback);
  });

  exports.getOrCreateMessageBox(sender_id, receiver_id, ep.done('message_box1'));
  exports.getOrCreateMessageBox(receiver_id, sender_id,  ep.done('message_box2'));
};
