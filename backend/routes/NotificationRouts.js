const express = require('express');
const router = express.Router();
const notificationController = require('../Controller/Notification/NotifController');
const authController = require('../Controller/authController/authController');

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/', notificationController.getUserNotifications);
router.patch('/mark-as-read/:id', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;