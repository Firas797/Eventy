import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Sample upcoming events data (you can replace with real data from Redux)
  const upcomingEvents = [
    {
      id: 1,
      title: "Tech Startup Conference",
      date: "June 10, 2024"
    },
    {
      id: 2,
      title: "Jazz Night Downtown",
      date: "June 15, 2024"
    }
  ];

  const handleCreateEvent = () => {
    navigate('/events/new');
  };

  const handleBecomeCreator = () => {
    navigate('/become-creator');
  };

  return (
    <div className="profile-container">
      {/* Cover Photo */}
      <div className="cover-photo" style={{ 
        backgroundImage: 'url("https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80")' 
      }}>
        <div className="profile-picture">
          <img 
            src={user?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"} 
            alt="Profile" 
          />
        </div>
        
        {/* Creator Badge */}
        {user?.roles?.creator?.verified && (
          <div className="creator-badge">
            <span>✓ Verified Creator</span>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="profile-info">
        <div className="profile-header">
          <h1>{user?.name || "User Name"}</h1>
          <p className="bio">{user?.bio || "No bio yet"}</p>
          
          <div className="profile-meta">
            {/* <span>📍 {user?.location || "Unknown location"}</span> */}
            <span>📅 Joined {new Date(user?.createdAt).toLocaleDateString() || "Unknown date"}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-number">{user?.stats?.eventsAttended || 0}</span>
            <span className="stat-label">Events</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{user?.stats?.eventsSaved || 0}</span>
            <span className="stat-label">Saved</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{user?.stats?.friends || 0}</span>
            <span className="stat-label">Interests</span>
          </div>
        </div>

        {/* Main Action Button */}
        {user?.roles?.creator?.verified ? (
          <button 
            className="edit-profile-btn"
            onClick={handleCreateEvent}
          >
           Create Event Now
          </button>
        ) : (
          <button 
            className="become-creator-btn"
            onClick={handleBecomeCreator}
          >
            ✨ Become a Creator
          </button>
        )}

        {/* Edit Profile Button */}
        <button className="edit-profile-btn">Edit Profile</button>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button className="tab active">About</button>
        <button className="tab">Events</button>
        <button className="tab">Photos</button>
        <button className="tab">Friends</button>
      </div>

      {/* Content Sections */}
      <div className="profile-content">
        {/* About Section */}
        <div className="content-section">
          <h2>About</h2>
          <div className="about-grid">
            <div className="about-card">
              <h3>Interests</h3>
              <div className="interests-list">
                {user?.interests?.length > 0 ? (
                  user.interests.map((interest, index) => (
                    <span key={index} className="interest-tag">{interest}</span>
                  ))
                ) : (
                  <p className="no-interests">No interests added yet</p>
                )}
              </div>
            </div>
            
            <div className="about-card">
              <h3>Upcoming Events</h3>
              {upcomingEvents.length > 0 ? (
                <ul className="events-list">
                  {upcomingEvents.map(event => (
                    <li key={event.id}>
                      <span className="event-title">{event.title}</span>
                      <span className="event-date">{event.date}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-events">No upcoming events</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;