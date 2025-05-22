import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSaveEvent } from '../Redux/auth/authSlice'; // Adjust path as needed
import './SavedEvents.css';

const SavedEvents = () => {
  const dispatch = useDispatch();
  // Get saved events from Redux store
  const { savedEvents, loading, error } = useSelector((state) => ({
    savedEvents: state.auth.savedEvents || [],
    loading: state.auth.loading,
    error: state.auth.error
  }));

  const handleUnsave = async (eventId) => {
    try {
      await dispatch(toggleSaveEvent(eventId)).unwrap();
      // The Redux state will update automatically
    } catch (err) {
      console.error('Failed to unsave event:', err);
      // You might want to show an error message to the user
    }
  };

  if (loading) {
    return (
      <div className="saved-container">
        <div className="saved-header">
          <h2>Your Saved Events</h2>
          <p>Loading your saved events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="saved-container">
        <div className="saved-header">
          <h2>Your Saved Events</h2>
          <p className="error-message">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-container">
      <div className="saved-header">
        <h2>Your Saved Events</h2>
        <p>Events you've saved for later</p>
      </div>
      
      <div className="saved-list">
        {savedEvents.length > 0 ? (
          savedEvents.map(event => (
            <div className="saved-item" key={event._id}>
              <div className="saved-image">
                <img 
                  src={event.image || "https://via.placeholder.com/300"} 
                  alt={event.title} 
                  className="interest-image" 
                />
                <span className="saved-category">{event.category || "Event"}</span>
              </div>
              
              <div className="saved-details">
                <div className="saved-main">
                  <h3>{event.title}</h3>
                  <div className="saved-meta">
                    <span className="saved-date">
                      <span>📅 {new Date(event.startDate).toLocaleDateString()}</span>
                    </span>
                    <span className="saved-location">
                      📍 {event.address || event.location || "Location not specified"}
                    </span>
                  </div>
                </div>
                
                <div className="saved-actions">
                  <button className="view-button">View Event</button>
                  <button 
                    className="unsave-button"
                    onClick={() => handleUnsave(event._id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                    Unsave
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-events-message">
            <p>You haven't saved any events yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedEvents;