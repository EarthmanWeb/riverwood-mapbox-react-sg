import React, { useRef, useEffect } from 'react';
import '../styles/components/PropertyImages.css';
import ErrorBoundary from './ErrorBoundary';

const PropertyImagesContent = ({ images, image }) => {  // Add image prop for featured image
  const slideshowRef = useRef(null);

  const handleWheel = (e) => {
    const container = slideshowRef.current;
    if (!container) return;

    // Check if we're at either edge
    const isAtRightEdge = container.scrollLeft + container.clientWidth >= container.scrollWidth;
    const isAtLeftEdge = container.scrollLeft <= 0;
    
    // Let the parent scroll if:
    // 1. We're at right edge AND scrolling right (positive deltaY)
    // 2. We're at left edge AND scrolling left (negative deltaY)
    if ((isAtRightEdge && e.deltaY > 0) || (isAtLeftEdge && e.deltaY < 0)) {
      return; // Let the event bubble up to parent
    }

    // Otherwise handle the scroll in the container
    e.preventDefault();
    container.scrollLeft += e.deltaY;
  };

  useEffect(() => {
    const container = slideshowRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const handleMouseDown = (e) => {
    const slider = slideshowRef.current;
    if (!slider) return;
    
    const startX = e.pageX - slider.offsetLeft;
    const startScroll = slider.scrollLeft;
    let isScrolling = true;

    const handleMouseMove = (e) => {
      if (!isScrolling) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const distance = x - startX;
      slider.scrollLeft = startScroll - distance;
    };

    const handleMouseUp = () => {
      isScrolling = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

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
    <div 
      className="property-popup-slideshow"
      ref={slideshowRef}
      onMouseDown={handleMouseDown}
    >
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
