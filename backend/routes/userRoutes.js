const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Get user's post count
    const postCount = await Post.countDocuments({ author: req.user.id });

    res.json({
      user: {
        ...user.toObject(),
        postCount
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      message: 'Server error while fetching profile' 
    });
  }
});

// @route   GET /api/users/:username
// @desc    Get user profile by username
// @access  Public
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ 
      username: req.params.username 
    }).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Get user's post count
    const postCount = await Post.countDocuments({ author: user._id });

    res.json({
      user: {
        ...user.toObject(),
        postCount
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      message: 'Server error while fetching user' 
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, bio, fullName, profilePicture } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Check if username is taken (if changing username)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Username already taken' 
        });
      }
      user.username = username;
    }

    // Check if email is taken (if changing email)
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ 
          message: 'Email already in use' 
        });
      }
      user.email = email;
    }

    // Update other fields
    if (bio !== undefined) user.bio = bio;
    if (fullName !== undefined) user.fullName = fullName;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        fullName: user.fullName,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      message: 'Server error while updating profile' 
    });
  }
});

// @route   PUT /api/users/password
// @desc    Change user password
// @access  Private
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters' 
      });
    }

    const user = await User.findById(req.user.id);

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ 
      message: 'Server error while changing password' 
    });
  }
});

// @route   GET /api/users/:username/posts
// @desc    Get posts by specific user
// @access  Public
router.get('/:username/posts', async (req, res) => {
  try {
    const user = await User.findOne({ 
      username: req.params.username 
    });

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    const posts = await Post.find({ author: user._id })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ 
      message: 'Server error while fetching user posts' 
    });
  }
});

module.exports = router;
