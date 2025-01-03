import React from 'react';
import '../styles/components/PropertyImages.css';
import ErrorBoundary from './ErrorBoundary';

const PropertyImagesContent = ({ images }) => {
  if (!images || typeof images !== 'object' || Object.keys(images).length === 0) {
    return <p>No images available</p>;
  }

  return (
    <div className="property-popup-slideshow">
      {Object.values(images).map((image, index) => (
        <img key={index} src={image} alt={`Slide ${index}`} />
      ))}
    </div>
  );
};

const PropertyImages = (props) => (
  <ErrorBoundary>
    <PropertyImagesContent {...props} />
  </ErrorBoundary>
);

export default PropertyImages;
