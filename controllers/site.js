var EventProxy = require('eventproxy');
var User = require('../proxy').User;
var Topic = require('../proxy').Topic;
var Tag = require('../proxy').Tag;
var config = require('../config').config;

exports.index = function (req, res, next) {
  var page = parseInt(req.query.page, 10) || 1;
  var keyword = req.query.q || '';
  var limit = config.list_topic_count;
  var render = function(err, topics) {
      res.render('forum/index', {
        topics: topics
      });
  };
  Topic.getTopicsByQuery(render);
}

      /*
      tags: all_tags,
      current_page: page,
      list_topic_count: limit,
      recent_tags: recent_tags,
      hot_topics: hot_topics,
      stars: stars,
      no_reply_topics: no_reply_topics,
      pages: pages,
      keyword: keyword
    });

  var render = function (tags, topics, hot_topics, stars, tops, no_reply_topics, pages) {
    var all_tags = tags.slice(0);

    tags.sort(function (tag_a, tag_b) {
      return tag_b.topic_count - tag_a.topic_count;
    });

    tags.sort(function (tag_a, tag_b) {
      return tag_b.create_at - tag_a.create_at;
    });

    var recent_tags = tag.slice(0, 5);
    res.render('forum/index', {
      tags: all_tags,
      topics: topics,
      current_page: page,
      list_topic_count: limit,
      recent_tags: recent_tags,
      hot_topics: hot_topics,
      stars: stars,
      no_reply_topics: no_reply_topics,
      pages: pages,
      keyword: keyword
    });
  };

  var proxy = EventProxy.create('tags', 'topics', 'hot_topics', 'stars', 'tops', 'no_reply_topics', 'pages', render);
  proxy.fail(next);

  Tag.getAllTags(proxy.done('tags'));
  var options = { skip: (page - 1) * limit, limit: limit, sort: [['topic', 'desc'], ['last_reply_at', 'desc']] };
  var query = {};
  if (keyword) {
    keyword = keyword.replace(/[\*\^\&\(\)\[\]\+\?\\]/g, '');
    query.title = new RegExp(keyworkd, 'i');
  }
  //TODO
  //Topic.getTopicsByQuery(query, options, proxy.done('topic'));
  Topic.getTopicsByQuery(options, proxy.done('topic'));
  console.log('ssssssss');
  Topic.getTopicsByQuery({ limit: 5, sort: [['visit_count', 'desc']]}, proxy.done('hot_topics'));
  Topic.getTopicsByQuery({ reply_count: 0 }, { limit: 5, sort: [ [ 'create_at', 'desc' ] ] }, proxy.done('no_reply_topics'));
  User.getUsersByQuery({ is_star: true }, { limit: 5 }, proxy.done('stars'));
  User.getUsersByQuery({ limit: 10, sort: [['score', 'desc']]}, proxy.done('topics'));
  Topic.getCountByQuery(query, proxy.done(function (all_topics_count) {
    console.log('dddddddddddddd');
    var pages = Math.ceil(all_topics_count / limit);
    proxy.emit('pages', pages);
  }));
};
*/
