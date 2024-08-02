const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  }],
  growthRate: {
    type: Number,
    default: 0,
  },
  engagementRate: {
    type: Number,
    default: 0,
  },
  topContributors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  totalMembers: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Community', communitySchema);


