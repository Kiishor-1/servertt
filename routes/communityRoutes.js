// routes/communityRoutes.js

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Community = require('../models/Community');
const User = require('../models/User');
const Member = require('../models/Member');
const authMiddleware = require('../middlewares/authMiddleware');
const updateMemberActiveStatus = require('../utils/updateMemberActiveStatus');

// Utility function to calculate metrics
const calculateMetrics = async (communityId) => {
  const community = await Community.findById(communityId)
    .populate('members', 'username joinDate isActive lastActive')
    .populate('messages', 'sender timestamp');

  // Calculate total members
  const totalMembers = community.members.length;

  // Calculate growth rate (example: new members in a given period)
  const growthRate = community.members.reduce((acc, member) => {
    const joinDate = member.joinDate ? member.joinDate.toISOString().slice(0, 10) : 'Unknown';
    if (!acc[joinDate]) {
      acc[joinDate] = 0;
    }
    acc[joinDate]++;
    return acc;
  }, {});

  const formattedGrowthRate = Object.keys(growthRate).map((date) => ({
    period: date,
    rate: growthRate[date],
  }));

  // Calculate engagement rate (messages per day in the last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const engagementRate = community.messages.reduce((acc, message) => {
    const messageDate = message.timestamp ? message.timestamp.toISOString().slice(0, 10) : 'Unknown';
    if (!acc[messageDate]) {
      acc[messageDate] = 0;
    }
    acc[messageDate]++;
    return acc;
  }, {});

  const formattedEngagementRate = Object.keys(engagementRate).map((date) => ({
    period: date,
    messages: engagementRate[date],
  }));

  // Calculate top contributors
  const messageCounts = {};
  if (community.messages) {
    community.messages.forEach((message) => {
      if (message.sender) {
        const userId = message.sender.toString();
        if (!messageCounts[userId]) {
          messageCounts[userId] = 0;
        }
        messageCounts[userId]++;
      }
    });
  }

  const topContributors = await Promise.all(
    Object.entries(messageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10) // Top 10 contributors
      .map(async ([userId]) => {
        const user = await User.findById(userId).select('username');
        return { username: user.username, messageCount: messageCounts[userId], userId: userId };
      })
  );

  // Calculate active and inactive members
  const activeMembers = community.members.filter((member) => member.isActive).length;
  const inactiveMembers = totalMembers - activeMembers;

  return {
    name: community.name,
    totalMembers,
    growthRate: formattedGrowthRate,
    engagementRate: formattedEngagementRate,
    topContributors,
    activeMembers,
    inactiveMembers,
  };
};

// Route to get community metrics
router.get('/:communityId/metrics', async (req, res) => {
  try {
    await updateMemberActiveStatus(); // Update member active statuses before calculating metrics
    const metrics = await calculateMetrics(req.params.communityId);
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching community metrics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to fetch all communities
router.get('/', async (req, res) => {
  try {
    const communities = await Community.find();
    res.json(communities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to fetch a single community
router.get('/:communityId', async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    res.json(community);
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:communityId/members', async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId).populate('members');
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    res.json(community.members);
  } catch (error) {
    console.error('Error fetching community members:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const communityAdmin = process.env.COMMUNITY_ADMIN;

// Route to create a new community
router.post('/', async (req, res) => {
  try {
    const { name, admin } = req.body;
    if (!admin || admin !== communityAdmin) {
      return res.status(404).json({ message: 'You are not authorized to create a community' });
    }

    // Check if the community already exists
    const existingCommunity = await Community.findOne({ name });
    if (existingCommunity) {
      return res.status(400).json({ message: 'Community already exists' });
    }

    // Create a new community
    const community = new Community({
      name,
      members: [],
      messages: [],
      growthRate: 0,
      engagementRate: 0,
      topContributors: [],
      totalMembers: 0,
    });

    await community.save();

    res.status(201).json({ message: 'Community created successfully', community });
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to join a community
router.post('/:communityId/join', authMiddleware, async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId).populate('members');
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const userId = req.user._id;
    const isMember = community.members.some(member => member.userId.toString() === userId.toString());
    if (isMember) {
      return res.status(400).json({ message: 'Already a member of the community' });
    }

    const member = new Member({
      username: req.user.username,
      joinDate: new Date(),
      isActive: true,
      userId: userId, // Store userId
    });

    await member.save();
    community.members.push(member._id);
    await community.save();

    const user = await User.findById(userId);
    user.communities.push(community._id);
    await user.save();

    res.json({ message: 'Successfully joined the community' });
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;








// const express = require('express');
// const mongoose = require('mongoose');
// const router = express.Router();
// const Community = require('../models/Community');
// const User = require('../models/User');
// const Member = require('../models/Member');
// const authMiddleware = require('../middlewares/authMiddleware');

// // Utility function to calculate metrics
// const calculateMetrics = async (communityId) => {
//   const community = await Community.findById(communityId)
//     .populate('members', 'username joinDate isActive')
//     .populate('messages', 'sender timestamp');

//   // Calculate total members
//   const totalMembers = community.members.length;

//   // Calculate growth rate (example: new members in a given period)
//   const growthRate = community.members.reduce((acc, member) => {
//     const joinDate = member.joinDate ? member.joinDate.toISOString().slice(0, 10) : 'Unknown';
//     if (!acc[joinDate]) {
//       acc[joinDate] = 0;
//     }
//     acc[joinDate]++;
//     return acc;
//   }, {});

//   const formattedGrowthRate = Object.keys(growthRate).map((date) => ({
//     period: date,
//     rate: growthRate[date],
//   }));
  

//   // Calculate engagement rate (messages per day in the last 7 days)
//   const oneWeekAgo = new Date();
//   oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
//   const engagementRate = community.messages.reduce((acc, message) => {
//     const messageDate = message.timestamp ? message.timestamp.toISOString().slice(0, 10) : 'Unknown';
//     if (!acc[messageDate]) {
//       acc[messageDate] = 0;
//     }
//     acc[messageDate]++;
//     return acc;
//   }, {});

//   const formattedEngagementRate = Object.keys(engagementRate).map((date) => ({
//     period: date,
//     messages: engagementRate[date],
//   }));

//   // Calculate top contributors
//   const messageCounts = {};
//   if (community.messages) {
//     community.messages.forEach((message) => {
//       if (message.sender) {
//         const userId = message.sender.toString();
//         if (!messageCounts[userId]) {
//           messageCounts[userId] = 0;
//         }
//         messageCounts[userId]++;
//       }
//     });
//   }

//   const topContributors = await Promise.all(
//     Object.entries(messageCounts)
//       .sort(([, a], [, b]) => b - a)
//       .slice(0, 10) // Top 10 contributors
//       .map(async ([userId]) => {
//         const user = await User.findById(userId).select('username');
//         return { username: user.username, messageCount: messageCounts[userId], userId: userId };
//       })
//   );

//   return {
//     name: community.name,
//     totalMembers,
//     growthRate: formattedGrowthRate,
//     engagementRate: formattedEngagementRate,
//     topContributors,
//   };
// };

// // Route to get community metrics
// router.get('/:communityId/metrics', async (req, res) => {
//   try {
//     const metrics = await calculateMetrics(req.params.communityId);
//     res.json(metrics);
//   } catch (error) {
//     console.error('Error fetching community metrics:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Route to fetch all communities
// router.get('/', async (req, res) => {
//   try {
//     const communities = await Community.find();
//     res.json(communities);
//   } catch (error) {
//     console.error('Error fetching communities:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Route to fetch a single community
// router.get('/:communityId', async (req, res) => {
//   try {
//     const community = await Community.findById(req.params.communityId);
//     if (!community) {
//       return res.status(404).json({ message: 'Community not found' });
//     }
//     res.json(community);
//   } catch (error) {
//     console.error('Error fetching community:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// router.get('/:communityId/members', async (req, res) => {
//   try {
//     const community = await Community.findById(req.params.communityId).populate('members');
//     console.log(community.members)
//     if (!community) {
//       return res.status(404).json({ message: 'Community not found' });
//     }
//     res.json(community.members);
//   } catch (error) {
//     console.error('Error fetching community members:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });


// const communityAdmin = process.env.COMMUNITY_ADMIN;


// // Route to create a new community
// router.post('/', async (req, res) => {
//   try {
//     const { name ,admin} = req.body;
//     console.log(admin);
//     if(!admin || admin !== communityAdmin){
//       return res.status(404).json({message:'You are not authorized to create a community'});
//     }

//     // Check if the community already exists
//     const existingCommunity = await Community.findOne({ name });
//     if (existingCommunity) {
//       return res.status(400).json({ message: 'Community already exists' });
//     }

//     // Create a new community
//     const community = new Community({
//       name,
//       members: [],
//       messages: [],
//       growthRate: 0,
//       engagementRate: 0,
//       topContributors: [],
//       totalMembers: 0,
//     });

//     await community.save();

//     res.status(201).json({ message: 'Community created successfully', community });
//   } catch (error) {
//     console.error('Error creating community:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Route to join a community
// router.post('/:communityId/join', authMiddleware, async (req, res) => {
//   try {
//     const community = await Community.findById(req.params.communityId).populate('members');
//     if (!community) {
//       return res.status(404).json({ message: 'Community not found' });
//     }

//     const userId = req.user._id;
//     const isMember = community.members.some(member => member.userId.toString() === userId.toString());
//     if (isMember) {
//       return res.status(400).json({ message: 'Already a member of the community' });
//     }

//     const member = new Member({
//       username: req.user.username,
//       joinDate: new Date(),
//       isActive: true,
//       userId: userId, // Store userId
//     });

//     await member.save();
//     community.members.push(member._id);
//     await community.save();

//     res.json({ message: 'Successfully joined the community' });
//   } catch (error) {
//     console.error('Error joining community:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });


// module.exports = router;
