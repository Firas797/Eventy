import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="main-header">
      <div className="header-content">
        <h1 className="header-title">Discover Nearby Events To You</h1>
        <p className="header-subtitle">Stay in the loop — you'll be notified about every exciting event happening near you. Great moments are just around the corner, don't miss out!.</p>
        <button className="header-btn">Explore Now</button>
      </div>
    </header>
  );
};

export default Header;
