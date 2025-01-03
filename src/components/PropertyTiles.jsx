import { useRef, useEffect } from 'react';
import './PropertyTiles.css';

export const PropertyTiles = ({ features, focusedFeatureId }) => {
  const scrollContainerRef = useRef(null);
  const tileRefs = useRef({});

  // Effect to scroll to focused feature
  useEffect(() => {
    if (focusedFeatureId && scrollContainerRef.current && tileRefs.current[focusedFeatureId]) {
      const container = scrollContainerRef.current;
      const tile = tileRefs.current[focusedFeatureId];
      
      const scrollLeft = tile.offsetLeft - container.offsetWidth / 2 + tile.offsetWidth / 2;
      console.log('Scrolling to:', scrollLeft);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [focusedFeatureId]);

  // Add wheel event handler
  const handleWheel = (e) => {
    e.preventDefault();
    const container = scrollContainerRef.current;
    if (container) {
      // Invert the delta to match natural scrolling direction
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

  return (
    <div 
      className="property-tiles-container" 
      ref={scrollContainerRef}
      onMouseDown={handleMouseDown}
    >
      {features.map((feature, index) => {
        const props = feature.properties;
        const isFocused = feature.properties.id === focusedFeatureId;
        console.log('Feature ID:', feature.properties.id, 'Focused:', isFocused);
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
          >
            <img src={props.image} alt={props.title} />
            <h4>{props.title}</h4>
            <p className="address">{props.display_address}</p>
            <p className="price">{priceRange}</p>
          </div>
        );
      })}
    </div>
  );
};
