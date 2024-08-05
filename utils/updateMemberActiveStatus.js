const Member = require('../models/Member');
const mongoose = require('mongoose');

const updateMemberActiveStatus = async () => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  try {
    const members = await Member.find();

    for (const member of members) {
      const lastActiveDate = new Date(member.lastActive);
      member.isActive = lastActiveDate >= threeDaysAgo;
      await member.save();
    }

    console.log('Member active statuses updated successfully');
  } catch (error) {
    console.error('Error updating member active statuses:', error);
  }
};

module.exports = updateMemberActiveStatus;
