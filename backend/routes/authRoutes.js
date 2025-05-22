const express = require('express');
const authController = require('../Controller/authController/authController');

const router = express.Router();

// AUTH ROUTES
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// USER ROUTES (Protected)
router
  .route('/me')
  .get(authController.protect, authController.getMe)
  .patch(authController.protect, authController.updateMe)
  .delete(authController.protect, authController.deleteMe);

router.post('/upgrade-to-creator', authController.protect, authController.upgradeToCreator);

// MESSAGING ROUTES
router.post('/message', authController.protect, authController.sendMessage);
router.get('/messages/:userId', authController.protect, authController.getMessagesWithUser);

// ADMIN ROUTES
router.get('/users', authController.protect, authController.restrictTo('admin'), authController.getAllUsers);
router
  .route('/users/:id')
  .get(authController.protect, authController.restrictTo('admin'), authController.getUser)
  .patch(authController.protect, authController.restrictTo('admin'), authController.updateUser)
  .delete(authController.protect, authController.restrictTo('admin'), authController.deleteUser);
  
// EVENT INTERACTION ROUTES
router.post('/save-event/:eventId', authController.protect, authController.toggleSaveEvent);
router.post(
  '/interested-event/:eventId',
  authController.protect,
  authController.toggleInterestedEvent
);router.get('/saved-events', authController.protect, authController.getSavedEvents);
router.get('/interested-events', authController.protect, authController.getInterestedEvents);

module.exports = router;
