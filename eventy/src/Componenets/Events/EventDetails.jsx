// src/components/EventDetails/EventDetails.js
import React from 'react';
import { useLocation, useParams } from "react-router-dom";
import { useSelector } from 'react-redux';
import './EventDetails.css';

const EventDetails = () => {
  const { eventId } = useParams();
  const events = useSelector(state => state.event.events?.data?.events || []);
const { state } = useLocation();
const { id } = useParams();

const event = state?.event;
  if (!event) {
    return <div className="event-not-found">Event not found</div>;
  }

  return (
    <div className="event-details-container">
      <div className="event-header">
        <h1>{event.title}</h1>
        <div className="event-meta">
          <span>📅 {new Date(event.startDate).toLocaleDateString()}</span>
          <span>⏰ {new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          {event.endDate && (
            <span> - {new Date(event.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          )}
        </div>
      </div>

      <div className="event-image-container">
        <img src={event.image || "https://via.placeholder.com/800x400"} alt={event.title} />
      </div>

      <div className="event-content">
        <div className="event-info">
          <div className="info-section">
            <h3>📍 Location</h3>
            <p>{event.address}</p>
          </div>

          <div className="info-section">
            <h3>ℹ️ About</h3>
            <p>{event.description || event.summary}</p>
          </div>

          <div className="info-section">
            <h3>📝 Details</h3>
            <p>{event.details || "No additional details provided."}</p>
          </div>
        </div>

        <div className="event-sidebar">
          <div className="ticket-section">
            <h3>🎟️ Tickets</h3>
            {event.isFree ? (
              <p>This is a free event</p>
            ) : (
              <p>Ticket price: ${event.price || "Not specified"}</p>
            )}
          </div>

          <button className="register-button">
            Register for Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;