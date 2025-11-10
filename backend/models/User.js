const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  bio: { 
    type: String, 
    maxlength: 500,
    default: ''
  },
  profilePicture: { 
    type: String,
    default: ''
  },
  fullName: {
    type: String,
    default: ''
  }
}, { 
  timestamps: true 
}); 

module.exports = mongoose.model('User', userSchema);