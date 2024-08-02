const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Community = require('../models/Community');

// Route to send a message
router.post('/:communityId', async (req, res) => {
  try {
    const { communityId } = req.params;
    const { userId, content } = req.body;

    const newMessage = new Message({
      community: communityId,
      sender: userId,
      content,
    });

    await newMessage.save();

    await Community.findByIdAndUpdate(communityId, {
      $push: { messages: newMessage._id },
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to get messages in a community
router.get('/:communityId', async (req, res) => {
  try {
    const { communityId } = req.params;

    const messages = await Message.find({ community: communityId }).populate('sender', 'username');

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

