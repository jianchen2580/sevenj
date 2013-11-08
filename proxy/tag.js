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

exports.getTagById = function (id, callback) {
  Tag.findOne({_id: id}, callback);
};

/**
 * 获取所有标签
 * Callback:
 * - err, 数据库异常
 * - tags, 标签列表
 * @param {Function} callback 回调函数
 */
exports.getAllTags = function (callback) {
  Tag.find({}, 'id name urlname description', {sort: [['order', 'asc']]}, callback);
};

/**
 * 获取hot标签
 * Callback:
 * - err, 数据库异常
 * - tags, the hotest 8 tags
 * @param {Function} callback 回调函数
 */
exports.getTagsByHot = function (callback) {
  Tag.find({}, 'id name urlname description', {sort: {create_at: -1}, limit: 8}, callback);
};

/**
 * 获取latest标签
 * Callback:
 * - err, 数据库异常
 * - tags, the latest 8 tags
 * @param {Function} callback 回调函数
 */
exports.getTagsByLatest = function (callback) {
  Tag.find({}, 'id name urlname description', {sort: [['order', 'asc']], limit: 8}, callback);
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

exports.newAndSave = function (parent_tag_id, name, urlname, background, description, callback) {
  var tag = new Tag();
  tag.parent_tag_id = parent_tag_id;
  tag.name = name;
  tag.urlname = urlname;
  tag.background = background;
  tag.description = description;
  tag.save(callback);
};
