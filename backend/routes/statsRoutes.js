const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

// @route   GET /api/stats
// @desc    Get platform statistics
// @access  Public
router.get('/', async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Get recent posts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentPosts = await Post.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get most active authors
    const topAuthors = await Post.aggregate([
      {
        $group: {
          _id: '$author',
          postCount: { $sum: 1 }
        }
      },
      { $sort: { postCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' },
      {
        $project: {
          username: '$author.username',
          postCount: 1
        }
      }
    ]);

    res.json({
      stats: {
        totalPosts,
        totalUsers,
        recentPosts,
        topAuthors
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      message: 'Server error while fetching stats' 
    });
  }
});

module.exports = router;
