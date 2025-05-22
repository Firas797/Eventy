const Notification = require('../models/Notification/Notification');
const User = require('../../models/User/Users');
const catchAsync = require('../utils/catchAsync');

exports.getUserNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort('-createdAt')
    .populate('eventId');
  
  res.status(200).json({
    status: 'success',
    results: notifications.length,
    data: { notifications }
  });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  
  if (!notification) {
    return next(new AppError('No notification found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: { notification }
  });
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });
  
  if (!notification) {
    return next(new AppError('No notification found with that ID', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});