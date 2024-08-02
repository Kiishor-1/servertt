const Community = require('../models/Community');
const Message = require('../models/Message');
const User = require('../models/User');

// Evaluate growth rate based on the number of messages in a community
const evaluateGrowthRate = async (communityId) => {
  const community = await Community.findById(communityId).populate('messages');
  const growthRate = community.messages.length / community.totalMembers;
  community.growthRate = growthRate;
  await community.save();
  return growthRate;
};

// Evaluate engagement rate based on the number of active users in a community
const evaluateEngagementRate = async (communityId) => {
  const community = await Community.findById(communityId).populate('members');
  const activeMembers = community.members.filter(member => member.active);
  const engagementRate = activeMembers.length / community.totalMembers;
  community.engagementRate = engagementRate;
  await community.save();
  return engagementRate;
};

// Evaluate top contributors based on the number of messages sent in a community
const evaluateTopContributors = async (communityId) => {
  const community = await Community.findById(communityId).populate('members');
  const members = community.members;
  const sortedMembers = members.sort((a, b) => b.totalMessages - a.totalMessages);
  const topContributors = sortedMembers.slice(0, 5); // Top 5 contributors
  community.topContributors = topContributors.map(member => member._id);
  await community.save();
  return topContributors;
};

// Evaluate active/inactive users based on their last active timestamp
const evaluateActiveUsers = async (communityId) => {
  const community = await Community.findById(communityId).populate('members');
  const activeThreshold = new Date();
  activeThreshold.setDate(activeThreshold.getDate() - 3); // 3 days threshold
  community.members.forEach(member => {
    member.active = member.lastActive > activeThreshold;
    member.save();
  });
  const activeUsers = community.members.filter(member => member.active);
  return {
    activeUsers,
    inactiveUsers: community.members.length - activeUsers.length,
  };
};

module.exports = {
  evaluateGrowthRate,
  evaluateEngagementRate,
  evaluateTopContributors,
  evaluateActiveUsers,
};
