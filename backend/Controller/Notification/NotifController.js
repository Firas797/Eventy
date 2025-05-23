const Notification = require('../../models/Notification/Notification');
const User = require('../../models/User/Users');
const catchAsync = require('../../utils/catchAsync');

exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if the welcome notification exists for the user
    const existingWelcome = await Notification.findOne({
      user: userId,
      isWelcome: true
    });

    if (!existingWelcome) {
      await Notification.create({
        user: userId,
        message: "Welcome to our platform! We'll notify you about nearby events and activities. You can also create your own events. Enjoy! <3",
        read: false,
        isWelcome: true
      });
    }

    // Return all notifications for this user
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean(); // Convert to plain JS objects

    // Return as array directly
    res.status(200).json(notifications);
    
    // OR as object with notifications property
    // res.status(200).json({ notifications });
    
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ 
      error: 'Failed to fetch notifications',
      details: err.message 
    });
  }
};
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