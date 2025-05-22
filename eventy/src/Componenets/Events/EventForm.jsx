// src/Components/EventForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  createNewEvent,
  resetEventState,
} from '../Redux/Event/eventSlice';
import Spinner from '../ui/Spinner';
import Alert from '../ui/Alert';
import './Events.css';

const EventForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector(state => state.event);
  const { user } = useSelector(state => state.auth);
const isCreator = user.roles.creator
console.log(isCreator)
  const [formData, setFormData] = useState({
  title: '',
  description: '',
  startDate: '',
  time: '',
  location: '',
  country: '', 
  category: 'entertainment',
  price: 0,
  capacity: 50,
  image: null,
  coordinates: { lat: '', lng: '' }
});

  const [imagePreview, setImagePreview] = useState('');
const startDate = new Date(`${formData.startDate}T${formData.time}:00`); // Add seconds

  useEffect(() => {
    return () => {
      dispatch(resetEventState());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    // Accept empty string or parse to float
    const floatVal = value === '' ? '' : parseFloat(value);
    setFormData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [name]: floatVal,
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, image: null }));
      setImagePreview('');
    }
  };
 // Early return checks (in order of priority)
  if (!user) {
    return (
      <div className="auth-message">
        <h2>Authentication Required</h2>
        <p>Please log in to create events.</p>
        <button onClick={() => navigate('/login')} className="btn btn-primary">
          Go to Login
        </button>
      </div>
    );
  }

  if (!user.roles?.creator?.isCreator) {
    return (
      <div className="auth-message">
        <h2>Creator Account Needed</h2>
        <p>Please upgrade to a creator account to list events.</p>
        <button onClick={() => navigate('/become-creator')} className="btn btn-primary">
          Become Creator
        </button>
      </div>
    );
  }

  if (!user.roles?.creator?.verified) {
    return (
      <div className="auth-message">
        <h2>Verification Required</h2>
        <p>Your creator account needs verification to publish events.</p>
        <button onClick={() => navigate('/verify-creator')} className="btn btn-primary">
          Verify Account
        </button>
      </div>
    );
  }
const handleSubmit = async (e) => {
  e.preventDefault();

  // 1. Create FormData object
  const formDataToSend = new FormData();

  // 2. Append all required fields
  // Basic info
  formDataToSend.append('title', formData.title);
  formDataToSend.append('description', formData.description);
  formDataToSend.append('summary', formData.description.substring(0, 100));

  // Category and tags
  formDataToSend.append('category', formData.category);
  formDataToSend.append('subCategory', 'general');
  formDataToSend.append('tags', JSON.stringify(['event']));

  // Date handling (ensure UTC format)
  const startDate = new Date(`${formData.startDate}T${formData.time}:00Z`);
  const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours later
  formDataToSend.append('startDate', startDate.toISOString());
  formDataToSend.append('endDate', endDate.toISOString());

  // Location data
  formDataToSend.append('locationType', 'physical');
  formDataToSend.append('address', formData.location);
  formDataToSend.append('country', 'Tunisia');
  formDataToSend.append('coordinates', JSON.stringify([
    parseFloat(formData.coordinates.lng || 0),
    parseFloat(formData.coordinates.lat || 0)
  ]));

  // Creator info
  formDataToSend.append('creator', user._id || user.id);
  formDataToSend.append('organizerName', user.name);

  // Image handling
  if (formData.image) {
  formDataToSend.append('image', formData.image);  // ✅ Matches backend expectation

  }

  // System fields
  formDataToSend.append('isRecurring', 'false');
  formDataToSend.append('isFree', formData.price === 0 ? 'true' : 'false');
  formDataToSend.append('isVerified', 'false');
  formDataToSend.append('isPromoted', 'false');

  // 3. Debug: Log all FormData entries
  console.log('FormData entries before submit:');
  for (let [key, value] of formDataToSend.entries()) {
    console.log(key, value);
  }

  try {
    // 4. Send the request
    const result = await dispatch(createNewEvent(formDataToSend));

    // 5. Handle success
    if (result.meta.requestStatus === 'fulfilled') {
      navigate(`/events/${result.payload._id}`);
    }
  } catch (error) {
    // 6. Enhanced error handling
    console.error('Event creation failed:', {
      error: error.toString(),
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    
    // You can add user feedback here if needed
    alert(`Event creation failed: ${error.response?.data?.message || error.message}`);
  }
};
  return (
    <div className="event-form-container">
      <div className="event-form-card">
        <h2>Create New Event</h2>
        {error && <Alert type="danger" message={error} />}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="title">Title*</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Event Title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description*</label>
            <textarea
              id="description"
              name="description"
              placeholder="Event Description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date*</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Time*</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location*</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="Event Location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category*</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="entertainment">entertainment</option>
              <option value="food">food-drink</option>
              <option value="sports">sports-fitness</option>
              <option value="culture">Culture</option>
              <option value="arts">business-networking</option>
                            <option value="arts">Promotion</option>
              <option value="arts">Cours</option>
              <option value="arts">Educative</option>
              <option value="arts">travel-accommodation</option>
              <option value="arts">learning-development</option>
              <option value="arts">Educative</option>

              <option value="theater">Theater</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Price (DT)*</label>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="capacity">Capacity*</label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              min="1"
              max="1000"
              value={formData.capacity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Coordinates (optional)</label>
            <input
              type="number"
              step="any"
              name="lat"
              placeholder="Latitude"
              value={formData.coordinates.lat}
              onChange={handleLocationChange}
            />
            <input
              type="number"
              step="any"
              name="lng"
              placeholder="Longitude"
              value={formData.coordinates.lng}
              onChange={handleLocationChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Event Image*</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary">
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
