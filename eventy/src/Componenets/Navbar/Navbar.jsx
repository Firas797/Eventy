import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { FaBell, FaEnvelope, FaBars, FaTimes, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../Redux/auth/authSlice';
import { fetchNotifications, markAsRead } from '../Redux/Notif/notifSlice';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: notifications, unreadCount } = useSelector((state) => state.notifications);
  
  const savedEvents = useSelector((state) => state.auth?.savedEvents || []);
  const interestedEvents = useSelector((state) => state.auth?.interestedEvents || []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, isAuthenticated]);

  const getUserName = () => {
    if (user?.name) return user.name;
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return decoded.name || '';
      } catch (error) {
        return '';
      }
    }
    return '';
  };

  useEffect(() => {
  if (isAuthenticated) {
    dispatch(fetchNotifications()).then((action) => {
      // Check if we need to show welcome notification
      const hasWelcome = action.payload?.notifications?.some(n => n.isWelcome);
      if (!hasWelcome) {
        // Create welcome notification if none exists
        dispatch(addNotification({
          _id: 'welcome-' + Date.now(),
          message: "Welcome to our platform! We'll notify you about nearby events and activities. You can also create your own events. Enjoy! <3",
          isWelcome: true,
          read: false,
          createdAt: new Date()
        }));
      }
    });
  }
}, [dispatch, isAuthenticated]);
  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (!isNotificationOpen) {
      notifications.forEach(notification => {
        if (!notification.read) {
          dispatch(markAsRead(notification._id));
        }
      });
    }
  };

  const handleNotificationItemClick = (notification) => {
    if (notification.eventId) {
      navigate(`/events/${notification.eventId._id}`);
    }
    if (!notification.read) {
      dispatch(markAsRead(notification._id));
    }
    setIsNotificationOpen(false);
  };

  const userName = getUserName();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          Eventy
        </div>

        <div className="desktop-nav">
          <ul className="nav-links">
            <li onClick={() => navigate('/')}>Accueil</li>
            <li onClick={() => navigate('/Interests')}>
              Interests {interestedEvents.length > 0 && <span className="count-badge">{interestedEvents.length}</span>}
            </li>
            <li onClick={() => navigate('/SavedEvents')}>
              Saves {savedEvents.length > 0 && <span className="count-badge">{savedEvents.length}</span>}
            </li>
            <li className="notification-icon-wrapper">
              <div className="notification-icon" onClick={handleNotificationClick}>
                <FaBell className="icon" />
                {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
              </div>
              {isNotificationOpen && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h4>Notifications</h4>
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="notification-empty">No notifications yet</div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification._id}
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                          onClick={() => handleNotificationItemClick(notification)}
                        >
                          <div className="notification-content">
                            {notification.message}
                          </div>
                          <div className="notification-time">
                            {new Date(notification.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </li>
            <li><FaEnvelope className="icon" /></li>
          </ul>
        </div>

        <div className="auth-buttons">
          {isAuthenticated ? (
            <div className="user-profile-container">
              <div 
                className="user-profile" 
                onClick={handleProfileClick}
                style={{ cursor: 'pointer' }}
              >
                <FaUserCircle className="user-icon" />
                <span className="user-name">{userName}</span>
              </div>
            </div>
          ) : (
            <>
              <button className="btn login" onClick={() => navigate('/login')}>Login</button>
              <button className="btn register" onClick={() => navigate('/register')}>Register</button>
            </>
          )}
          
          <button 
            className="menu-toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="mobile-menu">
            <ul>
              <li onClick={() => navigate('/')}>Accueil</li>
              <li onClick={() => navigate('/Interests')}>
                Interests {interestedEvents.length > 0 && <span className="count-badge">{interestedEvents.length}</span>}
              </li>
              <li onClick={() => navigate('/SavedEvents')}>
                Saves {savedEvents.length > 0 && <span className="count-badge">{savedEvents.length}</span>}
              </li>
              <li onClick={handleNotificationClick}>
                <FaBell className="icon" /> Notifications 
                {unreadCount > 0 && <span className="mobile-notification-count">{unreadCount}</span>}
              </li>
              <li><FaEnvelope className="icon" /> Messages</li>
              {isAuthenticated ? (
                <>
                  <li onClick={handleProfileClick}><FaUserCircle /> Profile</li>
                  <li onClick={handleLogout}><FaSignOutAlt /> Logout</li>
                </>
              ) : (
                <>
                  <li onClick={() => navigate('/login')}>Login</li>
                  <li onClick={() => navigate('/register')}>Register</li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;