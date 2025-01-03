import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';  // Add this import
import '../styles/components/PropertyTiles.css';
import PropertyPopup from './PropertyPopup'; // Import the new component
import React from 'react';
import ErrorBoundary from './ErrorBoundary';

export const PropertyTiles = ({ features, focusedFeatureId, setFocusedFeatureId }) => {
  const scrollContainerRef = useRef(null);
  const tileRefs = useRef({});
  const [selectedProperty, setSelectedProperty] = useState(null); // State to manage selected property
  const popupRef = useRef(null);  // Add this ref for popup management

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

  const handleTileHover = (feature, hovered) => {
    // console.log('Tile hover event:', { hovered, feature });
    const map = window.mapInstance;
    // console.log('Map instance from window:', map);

    if (!map) {
      console.error('Map instance not found!');
      return;
    }

    if (hovered) {
      // console.log('Creating popup for:', feature.properties.title);
      // console.log('Using coordinates:', feature.geometry.coordinates);

      if (popupRef.current) {
        // console.log('Removing existing popup');
        popupRef.current.remove();
      }
      
      try {
        popupRef.current = new mapboxgl.Popup({ 
          closeButton: false,
          className: 'property-hover-popup'
        })
          .setLngLat(feature.geometry.coordinates)
          .setHTML(`<h5 class="mb-0 pb-0">${feature.properties.title}</h5><p class="mb-0 pb-0">${feature.properties.display_address}</p>`)
          .addTo(map);
        
        // console.log('Popup created and added to map:', popupRef.current);
      } catch (error) {
        console.error('Error creating popup:', error);
      }
    } else {
      // console.log('Mouse leave - removing popup');
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    }
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
              onMouseEnter={() => handleTileHover(feature, true)}
              onMouseLeave={() => handleTileHover(feature, false)}
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
