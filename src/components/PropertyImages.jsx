import React from 'react';
import '../styles/components/PropertyImages.css';
import ErrorBoundary from './ErrorBoundary';

const PropertyImagesContent = ({ images, image }) => {  // Add image prop for featured image
  console.log('Raw images prop:', images);
  console.log('Featured image:', image);

  if (!images && !image) {
    console.log('No images available');
    return <p>No images available</p>;
  }

  // Convert string to object if needed
  let imageObject = images;
  if (typeof images === 'string') {
    try {
      imageObject = JSON.parse(images);
      console.log('Parsed from string:', imageObject);
    } catch (e) {
      console.error('Failed to parse images string:', e);
      return <p>No images available</p>;
    }
  }

  // Simple object check
  if (typeof imageObject !== 'object' || imageObject === null) {
    console.log('Invalid images format:', typeof imageObject);
    return <p>No images available</p>;
  }

  const imageUrls = [image, ...Object.values(imageObject)].filter(Boolean); // Combine featured image with other images
  console.log('Final image URLs:', imageUrls);

  if (imageUrls.length === 0) {
    return <p>No images available</p>;
  }

  return (
    <div className="property-popup-slideshow">
      {imageUrls.map((imageUrl, index) => (
        <img 
          key={index} 
          src={imageUrl} 
          alt={`Property view ${index === 0 ? 'featured' : index}`}
          loading="lazy"
          onError={(e) => {
            console.error(`Image ${index} failed to load:`, imageUrl);
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
          }}
        />
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
