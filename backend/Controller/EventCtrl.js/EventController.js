const Event = require('../../models/Events/EventsModel');
const Notification = require('../../models/Notification/Notification'); // <-- create this model
const User = require('../../models/User/Users'); // Make sure to import User model

// Create event
// Create event
exports.createEvent = async (req, res) => {
  try {
    // Handle both JSON and form-data
    let eventData;
    
    if (req.file) {
      eventData = {
        ...req.body,
        images: [req.file.buffer.toString('base64')],
        featuredImage: req.file.buffer.toString('base64')
      };
      
      if (req.body.coordinates) {
        eventData.coordinates = JSON.parse(req.body.coordinates);
      }
      if (req.body.tags) {
        eventData.tags = JSON.parse(req.body.tags);
      }
    } else {
      eventData = req.body;
    }

    // Add default values if needed
    if (!eventData.country) {
      eventData.country = 'Tunisia';
    }

    // Add the creator to the event data
    if (req.user?._id) {
      eventData.creator = req.user._id;
    }

    // Create the event in database
    const newEvent = await Event.create(eventData);

    // Notification logic - send to all users
    try {
      // Get all users (or exclude creator if you want)
      const filter = {};
      if (req.user?._id) {
        filter._id = { $ne: req.user._id }; // Exclude event creator
      }
      
      const users = await User.find(filter);
      
      // Only proceed if there are users to notify
      if (users.length > 0) {
        const notificationPromises = users.map(user => 
          Notification.create({
            user: user._id,
            message: `New event created: ${newEvent.title}`,
            event: newEvent._id,
            read: false
          })
        );
        
        await Promise.all(notificationPromises);
      }
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Continue even if notifications fail
    }

    res.status(201).json({
      status: 'success',
      data: { event: newEvent }
    });

  } catch (err) {
    console.error('Error creating event:', {
      body: req.body,
      file: req.file,
      error: err
    });
    
    res.status(400).json({
      status: 'fail',
      message: err.message,
      validationErrors: err.errors
    });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json({
      status: 'success',
      results: events.length,
      data: { events }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get event by ID or slug
exports.getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    // Find by _id or slug
    let event = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      event = await Event.findById(id);
    }
    if (!event) {
      event = await Event.findOne({ slug: id });
    }

    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Event not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { event }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });
    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Event not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: { event }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Event not found'
      });
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};