var models = require('../models'),
  Tag = models.Tag;

exports.getTagByName = function (name, callback) {
  Tag.findOne({name: name}, callback);
};

exports.getTagByUrlName = function (urlname, callback) {
  Tag.findOne({urlname: urlname}, callback);
};

/**
 * 根据标签ID列表，获取一组标签
 * Callback:
 * - err, 数据库异常
 * - tags, 标签列表
 * @param {Array} ids 标签ID列表
 * @param {Function} callback 回调函数
 */
exports.getTagsByIds = function (ids, callback) {
  Tag.find({_id: {'$in': ids}}, callback);
};

/**
 * 获取所有标签
 * Callback:
 * - err, 数据库异常
 * - tags, 标签列表
 * @param {Function} callback 回调函数
 */
exports.getAllTags = function (callback) {
  Tag.find({}, {sort: [['order', 'asc']]}, callback);
};

/**
 * 根据标签ID获取标签
 * Callback:
 * - err, 数据库异常
 * - tag, 标签
 * @param {String} id 标签ID
 * @param {Function} callback 回调函数
 */
exports.getTagById = function (id, callback) {
  Tag.findOne({_id: id}, callback);
};

exports.update = function (tag, name, background, order, description, callback) {
  tag.name = name;
  tag.order = order;
  tag.background = background;
  tag.description = description;
  tag.save(callback);
};

exports.newAndSave = function (name, urlname, background, description, callback) {
  var tag = new Tag();
  tag.name = name;
  tag.urlname = urlname;
  tag.background = background;
  tag.description = description;
  tag.save(callback);
};
