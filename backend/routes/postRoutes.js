const express = require('express');
const router = express.Router();
const xss = require('xss');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/auth');
const { validatePost } = require('../middleware/validators');
const { postLimiter } = require('../middleware/rateLimiter');

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', authMiddleware, postLimiter, validatePost, async (req, res) => {
  try {
    const { title, content, coverImage } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        message: 'Title and content are required'
      });
    }

    // Sanitize content to prevent XSS
    const sanitizedContent = xss(content);

    // Create post
    const post = new Post({
      title,
      content: sanitizedContent,
      coverImage: coverImage || '',
      author: req.user.id
    });

    await post.save();

    // Populate author details before sending response
    await post.populate('author', 'username');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      message: 'Server error while creating post'
    });
  }
});

// @route   GET /api/posts
// @desc    Get all posts with pagination and search
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // Build search query
    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const posts = await Post.find(query)
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      message: 'Server error while fetching posts'
    });
  }
});

// @route   GET /api/posts/user/my-posts
// @desc    Get current user's posts
// @access  Private
router.get('/user/my-posts', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json({ posts, count: posts.length });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({
      message: 'Server error while fetching user posts'
    });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profilePicture bio');

    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    res.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    // Handle invalid MongoDB ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid post ID'
      });
    }
    res.status(500).json({
      message: 'Server error while fetching post'
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private (author only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content, coverImage } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Not authorized to update this post'
      });
    }

    // Update post
    post.title = title || post.title;
    if (content) post.content = xss(content); // Sanitize content
    if (coverImage !== undefined) post.coverImage = coverImage;

    await post.save();
    await post.populate('author', 'username');

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      message: 'Server error while updating post'
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private (author only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Not authorized to delete this post'
      });
    }

    await post.deleteOne();

    res.json({
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      message: 'Server error while deleting post'
    });
  }
});

module.exports = router;
