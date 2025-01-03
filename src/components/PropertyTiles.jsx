import { useRef, useEffect, useState } from 'react';
import '../styles/components/PropertyTiles.css';
import PropertyPopup from './PropertyPopup'; // Import the new component
import React from 'react';
import ErrorBoundary from './ErrorBoundary';

export const PropertyTiles = ({ features, focusedFeatureId, setFocusedFeatureId }) => {
  const scrollContainerRef = useRef(null);
  const tileRefs = useRef({});
  const [selectedProperty, setSelectedProperty] = useState(null); // State to manage selected property

  // Effect to scroll to focused feature
  useEffect(() => {
    if (focusedFeatureId && scrollContainerRef.current && tileRefs.current[focusedFeatureId]) {
      const container = scrollContainerRef.current;
      const tile = tileRefs.current[focusedFeatureId];
      
      const scrollLeft = tile.offsetLeft - container.offsetWidth / 2 + tile.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [focusedFeatureId]);

  // Add wheel event handler
  const handleWheel = (e) => {
    e.preventDefault();
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollLeft -= e.deltaY;
    }
  };

  // Add useEffect to bind/unbind wheel event
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const handleMouseDown = (e) => {
    const slider = scrollContainerRef.current;
    let startX = e.pageX - slider.offsetLeft;
    let scrollLeft = slider.scrollLeft;

    const handleMouseMove = (e) => {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2;
      slider.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTileClick = (property) => {
    setSelectedProperty(property);
    setFocusedFeatureId(property.id); // Add this line to set focus when clicking tile
  };

  const handleClosePopup = () => {
    setSelectedProperty(null);
  };

  return (
    <ErrorBoundary>
      <div 
        className="property-tiles-container" 
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
      >
        {features.map((feature, index) => {
          const props = feature.properties;
          const isFocused = feature.properties.id === focusedFeatureId;
          let priceRange = 'Contact for Pricing';
          
          try {
            const tenants = JSON.parse(props.tenants);
            if (tenants?.length) {
              const prices = tenants.map(t => t.price);
              priceRange = `$${Math.min(...prices).toLocaleString()} - $${Math.max(...prices).toLocaleString()}`;
            }
          } catch (error) {
            console.error('Error parsing tenants:', error);
          }

          return (
            <div 
              key={feature.properties.id || index} 
              className={`property-tile ${isFocused ? 'focused' : ''}`}
              ref={el => tileRefs.current[feature.properties.id] = el}
              onClick={() => handleTileClick(props)} // Add click handler
            >
              <img 
                src={props.image} 
                alt={props.title} 
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent double handling
                  handleTileClick(props);
                }}
              />
              <h4>{props.title}</h4>
              <p className="address">{props.display_address}</p>
              <p className="price">{priceRange}</p>
            </div>
          );
        })}
      </div>
      {selectedProperty && (
        <PropertyPopup property={selectedProperty} onClose={handleClosePopup} />
      )}
    </ErrorBoundary>
  );
};
