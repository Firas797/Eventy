const mongoose = require('mongoose');
const slugify = require('slugify');

const eventSchema = new mongoose.Schema({
  // Core Info
  title: {
    type: String,
    required: [true, 'An event must have a title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'An event must have a description'],
    trim: true
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [300, 'Summary cannot exceed 300 characters']
  },

  // Categorization
  category: {
    type: String,
    required: true,
    enum: [
      'food-drink',
      'learning-development',
      'travel-accommodation',
      'entertainment',
            'Promotion',
      'Cours',
      'Sport',
      'Educative',
      'Travel',
            'Party',
                        'Camping',



      'sports-fitness',
      'business-networking',
      'Others'

    ]
  },
  subCategory: String, // e.g. 'wine-tasting', 'coding-bootcamp'
  tags: [String],

  // Logistics
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: String, // 'weekly', 'monthly', etc.

  // Location
  locationType: {
    type: String,
    enum: ['physical', 'online', 'hybrid'],
    default: 'physical'
  },
  address: String,
  coordinates: {
    type: [Number], // [longitude, latitude]
    index: '2dsphere'
  },
  onlineLink: String,

  // Media
  images: [String], // Array of image URLs
  featuredImage: String,

  // Pricing
  isFree: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  ticketsAvailable: Number,

  // Creator Info
  creator: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  organizerName: String,
  country: { type: String, required: true }, // ✅ Add this line

  // Verification & Promotion
  isVerified: {
    type: Boolean,
    default: false
  },
  isPromoted: {
    type: Boolean,
    default: false
  },
  promotionExpires: Date,

  // Engagement Metrics
  views: {
    type: Number,
    default: 0
  },
  saves: {
    type: Number,
    default: 0
  },
  attendees: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug before saving
eventSchema.pre('save', function(next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// Populate creator data on queries
eventSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'creator',
    select: 'name avatar roles.creator'
  });
  next();
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;