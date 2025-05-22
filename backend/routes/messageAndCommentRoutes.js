const express = require('express');
const messageAndCommentController = require('../Controller/UserCtrl/messageAndCommentController');
const authController = require('../Controller/authController/authController');

const router = express.Router();

// Protect routes after this middleware
router.use(authController.protect);

// Message Routes
router.post('/messages', messageAndCommentController.sendMessage);          // Send a message
router.get('/messages/:userId', messageAndCommentController.getMessages);  // Get messages with a specific user

// Comment Routes
router.post('/comments/:eventId', messageAndCommentController.addComment); // Add a comment to an event
router.get('/comments/:eventId', messageAndCommentController.getComments); // Get comments for a specific event

module.exports = router;
