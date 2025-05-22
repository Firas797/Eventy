import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInterestedEvents, toggleInterestedEvent } from '../Redux/auth/authSlice';
import './Interests.css';

const Interests = () => {
  const dispatch = useDispatch();
  const { interestedEvents } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchInterestedEvents());
    }
  }, [dispatch, user]);

  const handleRemoveInterest = async (eventId) => {
    try {
      await dispatch(toggleInterestedEvent(eventId)).unwrap();
      // The Redux state will update automatically
    } catch (err) {
      console.error('Failed to remove interest:', err);
    }
  };

  return (
    <div className="interests-container">
      <div className="interests-header">
        <h2>Your Interests</h2>
        <p>Events you've shown interest in</p>
      </div>
      
      <div className="interests-grid">
        {interestedEvents.length > 0 ? (
          interestedEvents.map(event => (
            <div className="interest-card" key={event._id}>
              <div className="interest-image-container">
                <img 
                  src={event.image || "https://via.placeholder.com/300"} 
                  alt={event.title} 
                  className="interest-image" 
                />
                <div className="interest-category">{event.category}</div>
              </div>
              
              <div className="interest-details">
                <h3>{event.title}</h3>
                <div className="interest-meta">
                  <span>📅 {new Date(event.startDate).toLocaleDateString()}</span>
                  <span>📍 {event.address}</span>
                </div>
                
                <div className="interest-actions">
                  <button className="view-button">View Event</button>
                  <button 
                    className="remove-button"
                    onClick={() => handleRemoveInterest(event._id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-events">
            <p>You haven't shown interest in any events yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Interests;