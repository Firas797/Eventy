// src/components/ui/Spinner.jsx
import React from 'react';
import './Spinner.css';

function Spinner() {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
}

export default Spinner;