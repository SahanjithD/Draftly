const { body, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Registration validation
const validateRegistration = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),

    body('email')
        .optional()
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail(),

    body('fullName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Full name cannot exceed 100 characters'),

    handleValidationErrors
];

// Login validation
const validateLogin = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username or email is required'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    handleValidationErrors
];

// Post creation validation
const validatePost = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters'),

    body('content')
        .trim()
        .notEmpty()
        .withMessage('Content is required')
        .isLength({ min: 10 })
        .withMessage('Content must be at least 10 characters long'),

    body('coverImage')
        .optional()
        .trim()
        .isURL()
        .withMessage('Cover image must be a valid URL'),

    handleValidationErrors
];

// User profile update validation
const validateUserUpdate = [
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio cannot exceed 500 characters'),

    body('fullName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Full name cannot exceed 100 characters'),

    body('profilePicture')
        .optional()
        .trim()
        .isURL()
        .withMessage('Profile picture must be a valid URL'),

    handleValidationErrors
];

module.exports = {
    validateRegistration,
    validateLogin,
    validatePost,
    validateUserUpdate
};
