var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TagSchema = new Schema({
  name: { type: String },
  urlname: { type: String },
  order: { type: Number, default: 1 },
  description: { type: String },
  topic_count: { type: Number, default: 0 },
  collect_count: { type: Number, default: 0 },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },

  icon_img: {type: String},
  head_img: {type: String},
  background: { type: String }
});

mongoose.model('Tag', TagSchema);
