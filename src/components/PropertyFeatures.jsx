import React from 'react';
import '../styles/components/PropertyFeatures.css';
import ErrorBoundary from './ErrorBoundary';

const formatFeature = (feature) => {
  return feature
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const PropertyFeaturesContent = ({ features }) => {
  if (!features || !Array.isArray(features)) {
    return null;
  }

  if (features.length === 0) {
    return null;
  }

  return (
    <div className="property-features">
      <h3>Features</h3>
      <ul className="features-list">
        {features.map((feature, index) => (
          <li key={index} className="feature-item">
            {formatFeature(feature)}
          </li>
        ))}
      </ul>
    </div>
  );
};

const PropertyFeatures = (props) => (
  <ErrorBoundary>
    <PropertyFeaturesContent {...props} />
  </ErrorBoundary>
);

export default PropertyFeatures;
