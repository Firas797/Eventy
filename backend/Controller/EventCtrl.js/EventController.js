const Event = require('../../models/Events/EventsModel');
const Notification = require('../../models/Notification/Notification'); // <-- create this model
const { sendRealTimeNotification } = require('../../websocket');

// Create event
exports.createEvent = async (req, res) => {
  try {
    // Handle both JSON and form-data
    let eventData;
    
    if (req.file) {
      // If form-data was sent
      eventData = {
        ...req.body,
        images: [req.file.buffer.toString('base64')], // or process file as needed
        featuredImage: req.file.buffer.toString('base64')
      };
      
      // Parse stringified fields
      if (req.body.coordinates) {
        eventData.coordinates = JSON.parse(req.body.coordinates);
      }
      if (req.body.tags) {
        eventData.tags = JSON.parse(req.body.tags);
      }
    } else {
      // If JSON was sent directly
      eventData = req.body;
    }

    // Add default values if needed
    if (!eventData.country) {
      eventData.country = 'Tunisia';
    }

    const event = await Event.create(eventData);
        await sendEventNotifications(event, req.user._id, req.app.get('sendRealTimeNotification'));

    res.status(201).json({
      status: 'success',
      data: { event }
    });
  } catch (err) {
    // More detailed error logging
    console.error('Error creating event:', {
      body: req.body,
      file: req.file,
      error: err
    });
    
    res.status(400).json({
      status: 'fail',
      message: err.message,
      validationErrors: err.errors // Include Mongoose validation errors
    });
  }
};

// Helper function to send notifications
async function sendEventNotifications(event, creatorId, sendRealTimeNotification) {
  try {
    // Find users who should receive notifications
    const usersToNotify = await User.find({
      $and: [
        { _id: { $ne: creatorId } },
        { 'notificationPreferences.push': true },
        { 
          $or: [
            { 'location.coordinates': { $near: { $geometry: { type: 'Point', coordinates: event.coordinates }, $maxDistance: 50000 } } },
            { interests: { $in: event.tags } }
          ]
        }
      ]
    });

    // Create notifications for each user
    const notificationPromises = usersToNotify.map(async user => {
      const notification = await Notification.create({
        user: user._id,
        message: `New event in your area: ${event.title}`,
        eventId: event._id
      });
      
      // Send real-time notification via WebSocket
      if (sendRealTimeNotification) {
        sendRealTimeNotification(user._id.toString(), {
          type: 'NEW_EVENT',
          data: notification
        });
      }
      
      return notification;
    });

    await Promise.all(notificationPromises);
  } catch (err) {
    console.error('Error sending notifications:', err);
  }
}

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
