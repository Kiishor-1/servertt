// src/schedule.js

const cron = require('node-cron');
const updateMemberActiveStatus = require('./utils/updateMemberActiveStatus');

// Schedule task to update member active statuses every day at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled task to update member active statuses');
  updateMemberActiveStatus();
});
