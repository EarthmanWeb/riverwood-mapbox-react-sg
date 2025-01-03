import React from 'react';
import '../styles/components/PropertyManager.css';
import ErrorBoundary from './ErrorBoundary';

const PropertyManagerContent = ({ manager }) => {
  return (
    <div>
      <h3>Property Manager</h3>
      <p>{manager}</p>
    </div>
  );
};

const PropertyManager = (props) => (
  <ErrorBoundary>
    <PropertyManagerContent {...props} />
  </ErrorBoundary>
);

export default PropertyManager;
