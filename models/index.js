var mongoose = require('mongoose');
var config = require('../config').config;

mongoose.connect(config.db, function (err) {
  if (err) {
    console.error('connect to %s error: ', config.db, err.message);
    process.exit(1);
  }
});

// models
require('./user');
require('./topic');
require('./topic_tag');
require('./topic_collect');
require('./relation');
/*
require('./tag');
require('./reply');
require('./tag_collect');
require('./message');
*/
exports.User = mongoose.model('User');
exports.Topic = mongoose.model('Topic');
exports.TopicCollect = mongoose.model('TopicCollect');
exports.TopicTag = mongoose.model('TopicTag');
exports.Relation = mongoose.model('Relation');
/*
exports.Tag = mongoose.model('Tag');
exports.TagCollect = mongoose.model('TagCollect');
exports.Reply = mongoose.model('Reply');
exports.Message = mongoose.model('Message');
*/