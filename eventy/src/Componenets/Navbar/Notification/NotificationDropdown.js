import React, { useEffect, useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotifications, markAsRead } from '../redux/notifSlice';
import { useNavigate } from 'react-router-dom';
import'./NotificationDropdown.css';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, unreadCount } = useSelector(state => state.notifications);
  
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      dispatch(markAsRead(notification._id));
    }
    if (notification.eventId) {
      navigate(`/events/${notification.eventId}`);
    }
    setIsOpen(false);
  };

  return (
    <div className="notification-dropdown">
      <div 
        className="notification-icon-container"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaBell className="notification-icon" />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>
      
      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            <span>{unreadCount} unread</span>
          </div>
          
          <div className="notification-list">
            {items.length === 0 ? (
              <div className="empty-notifications">No notifications yet</div>
            ) : (
              items.map(notification => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <p>{notification.message}</p>
                  <small>{new Date(notification.createdAt).toLocaleString()}</small>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;