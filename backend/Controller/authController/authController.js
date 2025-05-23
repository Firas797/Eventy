const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../../models/User/Users');
const Message = require('../../models/Messages/Messages'); // Ensure this path is correct

// 🔒 JWT Helper
const signToken = (id, name) => {
  return jwt.sign({ id, name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) throw new Error('You are not logged in! Please log in to get access.');

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) throw new Error('The user belonging to this token no longer exists.');
    
    // Add safe check for changedPasswordAfter method
    if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
      throw new Error('User recently changed password! Please log in again.');
    }

    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({ status: 'fail', message: err.message });
  }
};
// 🔒 Middleware: Restrict access to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

// ✅ Signup
exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      roles: { attendee: true }
    });

    const token = signToken(newUser._id, newUser.name);
    res.status(201).json({
      status: 'success',
      token,
      data: { user: newUser }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// ✅ Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new Error('Please provide email and password!');

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new Error('Incorrect email or password');
    }

    const token = signToken(user._id, user.name);
    res.status(200).json({
      status: 'success',
      token,
      user: {
        name: user.name,
        email: user.email,
        id: user._id,
        roles: user.roles  

      }
    });
  } catch (err) {
    res.status(401).json({ status: 'fail', message: err.message });
  }
};

// 🧠 Utility: Filter object fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// 🔄 Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✏️ Update current user
exports.updateMe = async (req, res) => {
  try {
    const filteredBody = filterObj(req.body, 'name', 'email', 'avatar', 'bio', 'location', 'interests');
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ status: 'success', data: { user: updatedUser } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// ❌ Deactivate account
exports.deleteMe = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// ⬆️ Upgrade to Creator
exports.upgradeToCreator = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'roles.creator': {
            isCreator: true,
            organizerName: req.body.organizerName,
            organizerType: req.body.organizerType
          }
        }
      },
      { new: true, runValidators: true }
    );

    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      business_type: 'individual',
      business_profile: {
        name: req.body.organizerName,
        product_description: 'Event organizer'
      }
    });

    user.roles.creator.stripeAccountId = account.id;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// 📩 Send Message
exports.sendMessage = async (req, res) => {
  try {
    const { receiver, content } = req.body;
    const message = await Message.create({ sender: req.user._id, receiver, content });
    res.status(201).json({ status: 'success', data: message });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// 📩 Get Messages With Specific User
exports.getMessagesWithUser = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    }).sort('timestamp');
    res.json({ data: messages });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// 🔧 ADMIN OPERATIONS

// 👥 Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ status: 'success', results: users.length, data: { users } });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};

// 🔎 Get user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};

// 🛠 Update user by ID
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// ❌ Delete user by ID
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
exports.toggleSaveEvent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const eventId = req.params.eventId;

    if (user.savedEvents.includes(eventId)) {
      await user.unsaveEvent(eventId);
    } else {
      await user.saveEvent(eventId);
    }

    // Get the updated user
    const updatedUser = await User.findById(req.user.id);
    
    res.status(200).json({
      status: 'success',
      action: user.savedEvents.includes(eventId) ? 'saved' : 'unsaved',
      user: updatedUser // Send back the updated user
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.toggleInterestedEvent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const eventId = req.params.eventId;

    if (user.interestedEvents.includes(eventId)) {
      await user.unmarkInterested(eventId);
    } else {
      await user.markInterested(eventId);
    }

    // Get the updated user
    const updatedUser = await User.findById(req.user.id);
    
    res.status(200).json({
      status: 'success',
      action: user.interestedEvents.includes(eventId) ? 'interested' : 'uninterested',
      user: updatedUser // Send back the updated user
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// 📋 Get Saved Events
exports.getSavedEvents = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('savedEvents') // This is crucial
      .exec();

    res.status(200).json({
      status: 'success',
      data: user.savedEvents // Now contains full event objects
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// 📋 Get Interested Events
exports.getInterestedEvents = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('interestedEvents');
    res.status(200).json({
      status: 'success',
      results: user.interestedEvents.length,
      data: user.interestedEvents
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};