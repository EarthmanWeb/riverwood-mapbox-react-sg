import React from 'react';
import '../styles/components/PropertyAddress.css';
import ErrorBoundary from './ErrorBoundary';

const PropertyAddressContent = ({ display_address, city, state, zipcode }) => {
  return (
    <div>
      <h3>Address</h3>
      <p>{display_address}</p>
      <p>{city}, {state} {zipcode}</p>
    </div>
  );
};

const PropertyAddress = (props) => (
  <ErrorBoundary>
    <PropertyAddressContent {...props} />
  </ErrorBoundary>
);

export default PropertyAddress;
