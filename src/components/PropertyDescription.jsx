import React from 'react';
import '../styles/components/PropertyDescription.css';
import ErrorBoundary from './ErrorBoundary';

const PropertyDescriptionContent = ({ description }) => {
  return (
    <div>
      <h3>Description</h3>
    <p>{description}</p>
    </div>
  );
};
const PropertyDescription = (props) => (
  <ErrorBoundary>
    <PropertyDescriptionContent {...props} />
  </ErrorBoundary>
);

export default PropertyDescription;
