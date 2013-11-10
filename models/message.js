var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
  
var MessageSchema = new Schema({
  message_box1_id: { type: ObjectId },
  message_box2_id: { type: ObjectId },

  sender_id: { type: ObjectId },
  receiver_id: { type: ObjectId },
  content: { type: String },

  role: { type: String },
  has_read: { type: Boolean, default: false },

  create_at: { type: Date, default: Date.now }
});

var MessageBoxSchema = new Schema({
  sender_id: { type: ObjectId },
  receiver_id: { type: ObjectId },
  role: { type: String, default: 'message' },
  has_read: { type: Boolean, default: false },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
});


mongoose.model('Message', MessageSchema);
mongoose.model('MessageBox', MessageSchema);
