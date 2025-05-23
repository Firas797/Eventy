import React from 'react';
import { useNotifications } from './useNotifications';
import { markNotificationAsRead, deleteNotification } from '../Redux/Notif/notifSlice';
import { useDispatch } from 'react-redux';

const NotificationList = () => {
  const { notifications, isLoading, error, hasWelcomeNotification } = useNotifications();
  const dispatch = useDispatch();

  if (isLoading) return <div>Loading notifications...</div>;
  if (error) return <div>Error: {error}</div>;
  console.log(notifications)

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      <ul className="notifications-list">
        {notifications.map((notification) => (
          <li
            key={notification._id}
            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
          >
            <div className="notification-content">
              <p>{notification.message}</p>
              <small>
                {new Date(notification.createdAt).toLocaleString()}
                {notification.isWelcome && ' • Welcome!'}
              </small>
            </div>
            <div className="notification-actions">
              {!notification.read && (
                <button
                  onClick={() => dispatch(markNotificationAsRead(notification._id))}
                >
                  Mark as read
                </button>
              )}
              <button
                onClick={() => dispatch(deleteNotification(notification._id))}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationList;