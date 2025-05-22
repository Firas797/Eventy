const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authController = require('../controllers/authController');

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/', notificationController.getUserNotifications);
router.patch('/mark-as-read/:id', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;