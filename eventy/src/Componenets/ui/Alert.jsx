// src/components/ui/Alert.jsx
import React from 'react';
import './Alert.css';

function Alert({ type = 'info', message }) {
  return (
    <div className={`alert alert-${type}`}>
      Alert
    </div>
  );
}

export default Alert;