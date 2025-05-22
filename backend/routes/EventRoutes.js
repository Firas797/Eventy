const express = require('express');
const eventController = require('../Controller/EventCtrl.js/EventController');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Create a new event (POST)
router.post(
  '/CreateNewEvent',
  upload.single('image'), // handles single file upload
  eventController.createEvent
);
// Get all events (GET)
router.get('/GetAllEvents', eventController.getAllEvents);

// Get one event by ID or slug (GET)
router.get('/GetEvent/:id', eventController.getEvent);

// Update event by ID (PATCH or PUT)
router.patch('/UpdateEvent/:id', eventController.updateEvent);

// Delete event by ID (DELETE)
router.delete('/DeleteEvent/:id', eventController.deleteEvent);

module.exports = router;
