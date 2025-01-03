import React from 'react';
import '../styles/components/PropertyLabels.css';
import ErrorBoundary from './ErrorBoundary';

const PropertyLabelsContent = ({ labels }) => {
  // console.log('PropertyLabels received labels:', labels);
  
  // Fix: Ensure we're handling both string arrays and JSON strings
  const normalizedLabels = (() => {
    if (!labels) return [];
    if (typeof labels === 'string') {
      try {
        return JSON.parse(labels);
      } catch (e) {
        return [labels];
      }
    }
    return Array.isArray(labels) ? labels.flat() : [labels];
  })();
    
  // console.log('Normalized labels:', normalizedLabels);

  if (!normalizedLabels || normalizedLabels.length === 0) {
    console.log('No labels to display, returning null');
    return null;
  }

  return (
    <div className="property-labels">
      <div className="labels-container">
        {normalizedLabels.map((label, index) => (
          <span key={`${label}-${index}`} className="property-label">
            {String(label).trim()}
          </span>
        ))}
      </div>
    </div>
  );
};

const PropertyLabels = (props) => (
  <ErrorBoundary>
    <PropertyLabelsContent {...props} />
  </ErrorBoundary>
);

export default PropertyLabels;
