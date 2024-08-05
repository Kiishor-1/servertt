const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  username: String,
  joinDate: Date,
  isActive: Boolean,
  lastActive: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Add this field
});

module.exports = mongoose.model('Member', MemberSchema);

