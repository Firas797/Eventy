import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { FaBell, FaEnvelope, FaBars, FaTimes, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../Redux/auth/authSlice';
import { fetchNotifications } from '../Redux/Notif/notifSlice';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: notifications } = useSelector((state) => state.notifications);
  
  // Get savedEvents and interestedEvents from Redux store
  const savedEvents = useSelector((state) => state.auth?.savedEvents || []);
  const interestedEvents = useSelector((state) => state.auth?.interestedEvents || []);

  // Get user name from Redux store or token
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

  const userName = getUserName();

  // Fetch notifications when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, isAuthenticated]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsMenuOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  // Get last 5 notifications
  const recentNotifications = notifications.slice(0, 5);

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
            <li className="notification-container">
              <FaBell 
                className="icon" 
                onClick={toggleNotifications}
              />
              {notifications.length > 0 && (
                <span className="notification-badge">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
              {isNotificationOpen && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h4>Notifications</h4>
                  </div>
                  {recentNotifications.length > 0 ? (
                    <>
                      {recentNotifications.map((notification) => (
                        <div key={notification._id} className="notification-item">
                          <p className="notification-message">{notification.message}</p>
                          <small className="notification-time">
                            {new Date(notification.createdAt).toLocaleString()}
                          </small>
                        </div>
                      ))}
                      <button 
                        className="view-all-btn"
                        onClick={() => {
                          navigate('/Notif');
                          setIsNotificationOpen(false);
                        }}
                      >
                        View All Notifications
                      </button>
                    </>
                  ) : (
                    <p className="no-notifications">No new notifications</p>
                  )}
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
              <li onClick={() => navigate('/Notif')}>
                <FaBell className="icon" /> Notifications
                {notifications.length > 0 && (
                  <span className="count-badge">{notifications.length}</span>
                )}
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