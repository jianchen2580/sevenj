/*!
 * nodeclub - controllers/topic.js
 */

/**
 * Module dependencies.
 */

var sanitize = require('validator').sanitize;

var at = require('../services/at');
var User = require('../proxy').User;
var Topic = require('../proxy').Topic;
var Tag = require('../proxy').Tag;
var Relation = require('../proxy').Relation;
var TopicTag = require('../proxy').TopicTag;
var TopicCollect = require('../proxy').TopicCollect;

var EventProxy = require('eventproxy');
var Util = require('../libs/util');
var config = require('../config').config;

/**
 * Topic page
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */

exports.home = function (req, res, next) {
  var page = parseInt(req.query.page, 10) || 1;
  var keyword = req.query.q || '';
  var limit = config.list_topic_count;
  var category = req.query.category
  var render = function(err, topics) {
      res.render('forum/index', {
        topics: topics,
        category: category
      });
  };
  Topic.getTopicsByQuery(render);
}
exports.index = function (req, res, next) {
  var topic_id = req.params.tid;
  if (topic_id.length !== 24) {
    return res.render('notify/notify', {
      error: '此话题不存在或已被删除。'
    });
  }
  
  Topic.getTopicById(topic_id, function (err, topic) {
    res.render('forum/topic_index', {
      topic: topic
    });
  });
}

exports.showCreate = function (req, res, next) {
  from_tag = req.query.tag;
  if (from_tag) { 
    Tag.getTagByUrlName(from_tag, function (err, from_tag){
      Tag.getAllTags(function (err, tags) {
        if (err) {
          return next(err);
        }
        res.render('forum/topic_edit', {from_tag: from_tag, tags: tags});
      });
    });
  } else {
    Tag.getAllTags(function (err, tags) {
      if (err) {
        return next(err);
      }
      res.render('forum/topic_edit', {tags: tags});
    });
  }
};

exports.create = function (req, res, next) {
  var title = sanitize(req.body.title).str.trim();
  var content = req.body.content;
  var topic_tags = [];
  var tag_name = sanitize(req.body.node_name).str.trim();

  Tag.getTagByName(tag_name, function (err, tag) {
    if (err) {
      return next(err);
    }

    Topic.newAndSave(title, content, req.session.user._id, tag._id,  function (err, topic) {
      if (err) {
        return next(err);
      }

      User.getUserById(req.session.user._id, function (err, user) {
        user.score += 5;
        user.topic_count += 1;
        user.save();
        res.redirect('/topic/' + topic._id);
      });
      //发送at消息
      at.sendMessageToMentionUsers(content, topic._id, req.session.user._id);
    });
  });
};

exports.showEdit = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('home');
    return;
  }

  var topic_id = req.params.tid;
  if (topic_id.length !== 24) {
    res.render('notify/notify', {error: '此话题不存在或已被删除。'});
    return;
  }
  Topic.getTopicById(topic_id, function (err, topic, tags) {
    if (!topic) {
      res.render('notify/notify', {error: '此话题不存在或已被删除。'});
      return;
    }
    if (String(topic.author_id) === String(req.session.user._id) || req.session.user.is_admin) {
      Tag.getAllTags(function (err, all_tags) {
        if (err) {
          return next(err);
        }
        /*
        for (var i = 0; i < tags.length; i++) {
          for (var j = 0; j < all_tags.length; j++) {
            if (tags[i].id === all_tags[j].id) {
              all_tags[j].is_selected = true;
            }
          }
        }
        */

        res.render('forum/topic_edit', {action: 'edit', topic_id: topic._id, title: topic.title, content: topic.content, tags: all_tags});
      });
    } else {
      res.render('notify/notify', {error: '对不起，你不能编辑此话题。'});
    }
  });
};

exports.update = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('/');
    return;
  }
  var topic_id = req.params.tid;
  if (topic_id.length !== 24) {
    res.render('notify/notify', {error: '此话题不存在或已被删除。'});
    return;
  }

  Topic.getTopicById(topic_id, function (err, topic, tags) {
    if (!topic) {
      res.render('notify/notify', {error: '此话题不存在或已被删除。'});
      return;
    }

    if (String(topic.author_id) === req.session.user._id || req.session.user.is_admin) {
      var title = sanitize(req.body.title).str.trim();
      var content = sanitize(req.body.content).str.trim();
      var topic_tags = [];
      /*
      if (req.body.topic_tags !== '') {
        topic_tags = req.body.topic_tags.split(',');
      }
      */

      if (title === '') {
        Tag.getAllTags(function (err, all_tags) {
          if (err) {
            return next(err);
          }
          for (var i = 0; i < topic_tags.length; i++) {
            for (var j = 0; j < all_tags.length; j++) {
              if (topic_tags[i] === all_tags[j]._id) {
                all_tags[j].is_selected = true;
              }
            }
          }
          res.render('forum/edit', {action: 'edit', edit_error: '标题不能是空的。', topic_id: topic._id, content: content, tags: all_tags});
        });
      } else {
        //保存话题
        //删除topic_tag，标签topic_count减1
        //保存新topic_tag
        topic.title = title;
        topic.content = content;
        topic.update_at = new Date();
        topic.save(function (err) {
          if (err) {
            return next(err);
          }

          var proxy = new EventProxy();
          var render = function () {
            res.redirect('/topic/' + topic._id);
          };
          proxy.assign('tags_removed_done', 'tags_saved_done', render);
          proxy.fail(next);

          // 删除topic_tag
          var tags_removed_done = function () {
            proxy.emit('tags_removed_done');
          };
          TopicTag.getTopicTagByTopicId(topic._id, function (err, docs) {
            if (docs.length === 0) {
              proxy.emit('tags_removed_done');
            } else {
              proxy.after('tag_removed', docs.length, tags_removed_done);
              // delete topic tags
              docs.forEach(function (doc) {
                doc.remove(proxy.done(function () {
                  Tag.getTagById(doc.tag_id, proxy.done(function (tag) {
                    proxy.emit('tag_removed');
                    tag.topic_count -= 1;
                    tag.save();
                  }));
                }));
              });
            }
          });
          // 保存topic_tag
          var tags_saved_done = function () {
            proxy.emit('tags_saved_done');
          };
          //话题可以没有标签
          if (topic_tags.length === 0) {
            proxy.emit('tags_saved_done');
          } else {
            proxy.after('tag_saved', topic_tags.length, tags_saved_done);
            //save topic tags
            topic_tags.forEach(function (tag) {
              TopicTag.newAndSave(topic._id, tag, proxy.done('tag_saved'));
              Tag.getTagById(tag, proxy.done(function (tag) {
                tag.topic_count += 1;
                tag.save();
              }));
            });
          }
          //发送at消息
          at.sendMessageToMentionUsers(content, topic._id, req.session.user._id);
        });
      }
    } else {
      res.render('notify/notify', {error: '对不起，你不能编辑此话题。'});
    }
  });
};

exports.delete = function (req, res, next) {
  //删除话题, 话题作者topic_count减1
  //删除回复，回复作者reply_count减1
  //删除topic_tag，标签topic_count减1
  //删除topic_collect，用户collect_topic_count减1
  if (!req.session.user || !req.session.user.is_admin) {
    return res.send({success: false, message: '无权限'});
  }
  var topic_id = req.params.tid;
  if (topic_id.length !== 24) {
    return res.send({ success: false, error: '此话题不存在或已被删除。' });
  }
  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return res.send({ success: false, message: err.message });
    }
    if (!topic) {
      return res.send({ success: false, message: '此话题不存在或已被删除。' });
    }
    topic.remove(function (err) {
      if (err) {
        return res.send({ success: false, message: err.message });
      }
      res.send({ success: true, message: '话题已被删除。' });
    });
  });
};

exports.top = function (req, res, next) {
  if (!req.session.user.is_admin) {
    res.redirect('home');
    return;
  }
  var topic_id = req.params.tid;
  var is_top = req.params.is_top;
  if (topic_id.length !== 24) {
    res.render('notify/notify', {error: '此话题不存在或已被删除。'});
    return;
  }
  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.render('notify/notify', {error: '此话题不存在或已被删除。'});
      return;
    }
    topic.top = is_top;
    topic.save(function (err) {
      if (err) {
        return next(err);
      }
      var msg = topic.top ? '此话题已经被置顶。' : '此话题已经被取消置顶。';
      res.render('notify/notify', {success: msg});
    });
  });
};

exports.collect = function (req, res, next) {
  var topic_id = req.body.topic_id;
  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.json({status: 'failed'});
    }

    TopicCollect.getTopicCollect(req.session.user._id, topic._id, function (err, doc) {
      if (err) {
        return next(err);
      }
      if (doc) {
        res.json({status: 'success'});
        return;
      }

      TopicCollect.newAndSave(req.session.user._id, topic._id, function (err) {
        if (err) {
          return next(err);
        }
        res.json({status: 'success'});
      });
      User.getUserById(req.session.user._id, function (err, user) {
        if (err) {
          return next(err);
        }
        user.collect_topic_count += 1;
        user.save();
      });

      req.session.user.collect_topic_count += 1;
      topic.collect_count += 1;
      topic.save();
    });
  });
};

exports.de_collect = function (req, res, next) {
  var topic_id = req.body.topic_id;
  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.json({status: 'failed'});
    }
    TopicCollect.remove(req.session.user._id, topic._id, function (err) {
      if (err) {
        return next(err);
      }
      res.json({status: 'success'});
    });

    User.getUserById(req.session.user._id, function (err, user) {
      if (err) {
        return next(err);
      }
      user.collect_topic_count -= 1;
      user.save();
    });

    topic.collect_count -= 1;
    topic.save();

    req.session.user.collect_topic_count -= 1;
  });
};
