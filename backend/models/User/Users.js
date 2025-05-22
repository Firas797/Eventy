const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isEmail } = require('validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Minimum password length is 6 characters'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords do not match'
    }
  },
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  avatar: {
    type: String,
    default: 'https://eventy.app/default-avatar.png'
  },
  bio: String,
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String
  },
  roles: {
    attendee: { type: Boolean, default: true },
    creator: {
      isCreator: { type: Boolean, default: false },
      organizerName: String,
      organizerType: {
        type: String,
        enum: ['individual', 'restaurant', 'hotel', 'business', 'other']
      },
      verified: { type: Boolean, default: false },
      stripeAccountId: String
    }
  },
  paymentMethods: [{
    type: { type: String, enum: ['card', 'paypal'] },
    stripePaymentMethodId: String,
    isDefault: Boolean
  }],
  credits: {
    type: Number,
    default: 0
  },
  interests: {
    type: [String],
    enum: ['food', 'learning', 'travel', 'entertainment', 'sports', 'business'],
    default: []
  },
 notificationPreferences: {
  email: { type: Boolean, default: true },
  push: { type: Boolean, default: true },
  frequency: { type: String, enum: ['instant', 'daily', 'weekly'], default: 'instant' }
},

 savedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: []
  }],
  interestedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: []
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: Date
});


userSchema.index({ 'location.coordinates': '2dsphere' });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
// Add to your User schema methods
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Also add this to track password changes
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};



userSchema.methods.saveEvent = async function(eventId) {
  if (!this.savedEvents.includes(eventId)) {
    this.savedEvents.push(eventId);
    await this.save({ validateBeforeSave: false });
  }
  return this;
};

userSchema.methods.unsaveEvent = async function(eventId) {
  this.savedEvents = this.savedEvents.filter(id => id.toString() !== eventId.toString());
  await this.save({ validateBeforeSave: false });
  return this;
};

userSchema.methods.markInterested = async function(eventId) {
  if (!this.interestedEvents.includes(eventId)) {
    this.interestedEvents.push(eventId);
    await this.save({ validateBeforeSave: false });
  }
  return this;
};

userSchema.methods.unmarkInterested = async function(eventId) {
  this.interestedEvents = this.interestedEvents.filter(id => id.toString() !== eventId.toString());
  await this.save({ validateBeforeSave: false });
  return this;
};

userSchema.methods.getSavedEvents = async function() {
  await this.populate('savedEvents');
  return this.savedEvents;
};

userSchema.methods.getInterestedEvents = async function() {
  await this.populate('interestedEvents');
  return this.interestedEvents;
};
userSchema.pre('validate', function(next) {
  console.log('Validating user:', this._id);
  console.log('Modified paths:', this.modifiedPaths());
  next();
});
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
