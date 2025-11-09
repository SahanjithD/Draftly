const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register route
router.post('/register', async (req, res) => {
    try{
        const {username,password} =req.body;
        
        const existingUser = await User.findOne({username});
        if(existingUser){
            return res.status(400).json({message: 'Username already exists'});
        }

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        //create new user
        const newUser = new User({username, password: hashedPassword});
        await newUser.save();

        const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET, {expiresIn: '1h'});
        res.json({token});
    }
    catch(err){
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
});

// Login route
router.post('/login', async (req, res) => {
    try{
        const {username,password} =req.body;

        //check if user exists
        const user = await User.findOne({username});
        if(!user){
            return res.status(400).json({message: 'Invalid credentials'});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: 'Invalid credentials'});
        }

        //create and return JWT
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});
        res.json({token});
    }
    catch(err){
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
});

module.exports = router;