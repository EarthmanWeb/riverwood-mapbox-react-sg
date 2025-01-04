import { useNavigate, useParams } from 'react-router-dom';
import { FaFilter } from 'react-icons/fa';
import FilterPanel from './FilterPanel';
import { useSearchParams } from 'react-router-dom';

// Mapbox import
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
// import "mapboxgl-legend/dist/style.css";
import { MapContext } from "../App";
import "../styles/components/Map.css";

import { useRef, useEffect, useContext, useState } from "react";
// import ReactDOM from "react-dom/client";
import { useUpdateEffect } from "react-use";

// custom home button
import HomeControl, { homeControlFunctionality } from "../utils/HomeControl";

// add Mapbox API key via env file
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;

import { MockDataService } from '../services/MockDataService';
import style from '../styles/style.json';  // Update import to use style.json
import { PropertyTiles } from './PropertyTiles';
import PropertyPopup from '../components/PropertyPopup';
import { FilterService } from '../services/FilterService';

export const Map = ({ lng, lat, zoom }) => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const mapDiv = useRef(null);
  const map = useRef(null);
  const popup = useRef(null);
  const popupTimeout = useRef(null); // Add this line
  const [visibleFeatures, setVisibleFeatures] = useState([]);
  const [focusedFeatureId, setFocusedFeatureId] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [activeFilters, setActiveFilters] = useState({});
  const [filteredFeatures, setFilteredFeatures] = useState([]); // Add this line
  const [allFeatures, setAllFeatures] = useState([]); // Add this line to store all features

  // variables relating to map
  const {} = useContext(MapContext);

  // Simpler layer addition
  const addMapLayers = () => {
    if (!map.current || !map.current.getSource('properties')) {
      console.warn('Property source not ready');
      return;
    }

    try {
      if (map.current.getLayer('property-points')) {
        map.current.off('click', 'property-points');
        map.current.off('mouseenter', 'property-points');
        map.current.off('mouseleave', 'property-points');
        map.current.removeLayer('property-points');
      }

      // Add circle layer with fixed pixel size
      map.current.addLayer({
        id: 'property-points',
        type: 'circle',
        source: 'properties',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            10, 8,  // smaller at zoom level 10
            16, 12   // larger at zoom level 16
          ],
          'circle-color': '#ffffff', 
          'circle-stroke-width': 5.5,
          'circle-stroke-color': '#00008B',
          'circle-pitch-alignment': 'map'
        }
      });

      bindLayerEvents();

    } catch (error) {
      console.error('Error adding map layers:', error);
    }
  };

  const createPopup = (feature) => {
    if (popup.current) popup.current.remove();
    
    // Add the handler to window with proper context
    const handlerId = `handlePropertyDetails_${feature.properties.id}`;
    window[handlerId] = () => {
      // Button click handler - updates URL and shows details
      const slug = MockDataService.getInstance().generateSlug(feature.properties.title);
      navigate(`/${slug}`);
      setSelectedProperty(feature.properties);
      setFocusedFeatureId(feature.properties.id);
    };

    popup.current = new mapboxgl.Popup({ 
      closeButton: true,
      className: 'property-hover-popup',
      onClose: () => {
        delete window[handlerId];
      }
    })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(`
        <h5 class="mb-0 pb-0">${feature.properties.title}</h5>
        <p class="mb-0 pb-0">${feature.properties.display_address}</p>
        <button class="details-button" onclick="try { window['${handlerId}'](); } catch(e) { console.error('Button click error:', e); }">Details</button>
      `)
      .addTo(map.current);

    // Add hover detection to the popup element
    const popupElement = popup.current.getElement();
    popupElement.addEventListener('mouseenter', () => {
      if (popupTimeout.current) {
        clearTimeout(popupTimeout.current);
        popupTimeout.current = null;
      }
    });
    popupElement.addEventListener('mouseleave', () => {
      startPopupTimeout();
    });
  };

  const startPopupTimeout = () => {
    if (popupTimeout.current) {
      clearTimeout(popupTimeout.current);
    }
    popupTimeout.current = setTimeout(() => {
      if (popup.current && !popup.current._clickPersisted) {
        popup.current.remove();
      }
    }, 2000);
  };

  const bindLayerEvents = () => {
    map.current.off('click', 'property-points');
    map.current.off('mouseenter', 'property-points');
    map.current.off('mouseleave', 'property-points');

    // Restore original click behavior - just focuses the marker
    map.current.on('click', 'property-points', (e) => {
      if (!e.features?.[0]) return;
      const featureId = e.features[0].properties.id;
      setFocusedFeatureId(featureId);
      createPopup(e.features[0]);
    });

    // Hover handlers
    map.current.on('mouseenter', 'property-points', (e) => {
      map.current.getCanvas().style.cursor = 'pointer';
      
      if (e.features.length > 0) {
        createPopup(e.features[0]);
      }
    });

    map.current.on('mouseleave', 'property-points', () => {
      map.current.getCanvas().style.cursor = '';
      if (popup.current) {
        startPopupTimeout();
      }
    });
  };

  const preloadImages = (features) => {
    features.forEach(feature => {
      const img = new Image();
      img.src = feature.properties.image;
    });
  };

  // Initial loading of data, setting global settings, adding nav controls
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapDiv.current,
      style: style, // Use local style.json
      center: [lng, lat],
      zoom: zoom,
      pitch: 0, // Force flat view
      bearing: 0, // Force north orientation
      pitchWithRotate: false, // Disable pitch with rotate gesture
      maxPitch: 0, // Prevent any pitch adjustment
      minPitch: 0,  // Prevent any pitch adjustment
      minZoom: 5.5, // Add minimum zoom level
      maxBounds: [
        [-170.15, 14.0], // Southwest coordinates (includes Mexico)
        [-50.31, 70.01]   // Northeast coordinates (includes Maine)
      ]
    });

    // Make map instance globally available
    window.mapInstance = map.current;
    // console.log('Map instance set to window.mapInstance:', window.mapInstance);

    // Single load event
    map.current.on('load', async () => {
      try {
        const mockDataService = MockDataService.getInstance();
        await mockDataService.loadMockData();
        const geoJsonProperties = mockDataService.getGeoJsonFeatures();
        setAllFeatures(geoJsonProperties); // Store all features
        setDataLoaded(true); // Set data loaded flag

        // Preload images
        preloadImages(geoJsonProperties);

        // Add source
        map.current.addSource('properties', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: geoJsonProperties
          }
        });

        // Add layer and bind events
        addMapLayers();
        
        // Update visible features after layer is added
        updateVisibleFeatures();
        
        // Add other controls
        // map.current.addControl(new mapboxgl.FullscreenControl(), "top-left"); // Remove this line
        map.current.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true }
          ), 
          "top-left"
        );
        map.current.addControl(new HomeControl(), "top-left");
        
        // Add navigation control with zoom buttons after home control
        map.current.addControl(
          new mapboxgl.NavigationControl({
            showCompass: false, // Hide rotation control
            showZoom: true,     // Show zoom controls
            visualizePitch: false,
            pitchWithRotate: false
          }),
          'top-left'
        );
        
        // Home button functionality
        homeControlFunctionality(map.current, lng, lat, zoom);

        // Fit bounds with more conservative padding
        if (geoJsonProperties.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          geoJsonProperties.forEach(feature => {
            bounds.extend(feature.geometry.coordinates);
          });
          
          map.current.fitBounds(bounds, {
            padding: {
              top: 100,
              bottom: 100,
              left: 100,
              right: 100
            },
            maxZoom: 15
          });
        }

        // Add this after all initialization is complete
        setTimeout(() => {
          map.current.resize();
          // Force a re-render of layers
          if (map.current.getSource('properties')) {
            addMapLayers();
          }
        }, 100);

        // console.log('Properties loaded and added to map');
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    });

    // Add cleanup function
    return () => {
      if (popup.current) {
        popup.current.remove();
      }
      if (popupTimeout.current) {
        clearTimeout(popupTimeout.current);
      }
    };
  }, []);

  // Move slug handling to a separate effect that depends on dataLoaded
  useEffect(() => {
    if (!dataLoaded || !slug || !map.current) return;

    console.log('Attempting to find property for slug after data load:', slug);
    const mockDataService = MockDataService.getInstance();
    const property = mockDataService.findPropertyBySlug(slug);
    
    if (property) {
      console.log('Found property after data load:', property);
      setSelectedProperty(property);
      setFocusedFeatureId(property.id);

      // Remove zoom parameter entirely to maintain current zoom level
      map.current.flyTo({
        center: [Number(property.lng), Number(property.lat)],
        essential: true,
        duration: 2000  // Add smooth animation duration
      });
    }
  }, [dataLoaded, slug]);

  const update = () => {
    // If layer exists delete layer
    // if (map.current.getLayer()) {
    //   map.current.removeLayer();
    // }

    // Re-adds default/initial map layers
    addMapLayers();
  };

  // run an effect (update function) only on updates of dependency array
  useUpdateEffect(update, []);

  // Separate bounds checking from filtering
  const updateVisibleFeatures = () => {
    if (!map.current || !allFeatures.length) return;
    
    const bounds = map.current.getBounds();
    const features = allFeatures.filter(feature => {
      const [lng, lat] = feature.geometry.coordinates;
      return (
        lng >= bounds.getWest() &&
        lng <= bounds.getEast() &&
        lat >= bounds.getSouth() &&
        lat <= bounds.getNorth()
      );
    });
    
    setVisibleFeatures(features);
  };

  // Update filtered features when either bounds or filters change
  useEffect(() => {
    const filtered = FilterService.filterFeatures(visibleFeatures, activeFilters);
    
    if (map.current?.getSource('properties')) {
      map.current.getSource('properties').setData({
        type: 'FeatureCollection',
        features: filtered
      });
    }
    
    setFilteredFeatures(filtered);
  }, [visibleFeatures, activeFilters]);

  // Update visible features on map movement
  useEffect(() => {
    if (!map.current || !allFeatures.length) return;

    const handleMapMove = () => {
      updateVisibleFeatures();
    };

    map.current.on('moveend', handleMapMove);
    map.current.on('zoomend', handleMapMove);

    // Initial update
    updateVisibleFeatures();

    return () => {
      if (map.current) {
        map.current.off('moveend', handleMapMove);
        map.current.off('zoomend', handleMapMove);
      }
    };
  }, [allFeatures]); // Only depends on allFeatures

  useEffect(() => {
    // Global handler for opening property details
    window.openPropertyDetails = (property) => {
      setSelectedProperty(property);
    };

    return () => {
      delete window.openPropertyDetails;
    };
  }, []);

  // Add debug logs to property selection
  const handlePropertySelect = (property) => {
    const mockDataService = MockDataService.getInstance();
    const slug = mockDataService.generateSlug(property.title);
    
    // Preserve existing search params when navigating
    const currentParams = Object.fromEntries(searchParams.entries());
    const queryString = new URLSearchParams(currentParams).toString();
    
    navigate(`/${slug}${queryString ? '?' + queryString : ''}`);
    setSelectedProperty(property);
    setFocusedFeatureId(property.id);
  };

  // Update popup close handler to preserve filters
  const handlePopupClose = () => {
    setSelectedProperty(null);
    // Preserve existing search params when closing
    const currentParams = Object.fromEntries(searchParams.entries());
    const queryString = new URLSearchParams(currentParams).toString();
    navigate(queryString ? '/?' + queryString : '/');
  };

  // Handle filter changes
  const handleFiltersChange = (filters) => {
    setActiveFilters(filters);
  };

  // Filter visible features based on active filters
  const getFilteredFeatures = () => {
    // If no filters are active, return all visible features
    if (!Object.keys(activeFilters).length) {
      return visibleFeatures;
    }
    return FilterService.filterFeatures(visibleFeatures, activeFilters);
  };

  // Update filtered features and map when dependencies change
  useEffect(() => {
    console.log('Updating filtered features:', {
      visibleCount: visibleFeatures.length,
      filters: activeFilters
    });

    const filtered = getFilteredFeatures();
    setFilteredFeatures(filtered);

    // Only update map source if it exists and data has changed
    if (map.current?.getSource('properties')) {
      const source = map.current.getSource('properties');
      const currentData = source.serialize().data;
      const newData = {
        type: 'FeatureCollection',
        features: filtered
      };

      // Only update if data has actually changed
      if (JSON.stringify(currentData) !== JSON.stringify(newData)) {
        source.setData(newData);
      }
    }
  }, [visibleFeatures, activeFilters]); // Only run when these dependencies change

  // Apply filters from URL on mount
  useEffect(() => {
    const filters = {};
    for (const [key, value] of searchParams.entries()) {
      filters[key] = value;
    }
    setActiveFilters(filters);
  }, []);

  // Apply both filters and slug on mount/update
  useEffect(() => {
    if (!dataLoaded) return;

    // Handle property detail if slug exists
    if (slug) {
      const mockDataService = MockDataService.getInstance();
      const property = mockDataService.findPropertyBySlug(slug);
      
      if (property) {
        setSelectedProperty(property);
        setFocusedFeatureId(property.id);
        map.current?.flyTo({
          center: [Number(property.lng), Number(property.lat)],
          essential: true,
          duration: 2000
        });
      }
    }

    // Apply filters from URL
    const filters = {};
    for (const [key, value] of searchParams.entries()) {
      filters[key] = value;
    }
    setActiveFilters(filters);
  }, [dataLoaded, slug, searchParams]);

  return (
    <>
      <div ref={mapDiv} id="mapDiv"></div>
      <button 
        className={`filter-button ${Object.keys(activeFilters).length > 0 ? 'active' : ''}`}
        onClick={() => setIsFilterOpen(true)}
      >
        <FaFilter />
        <span className="filter-button-text">Filter Results</span>
      </button>
      <FilterPanel 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)}
        visibleFeatures={filteredFeatures}
        onFiltersChange={handleFiltersChange}
      />
      <PropertyTiles 
        features={filteredFeatures}
        focusedFeatureId={focusedFeatureId}
        setFocusedFeatureId={setFocusedFeatureId}
        onPropertySelect={handlePropertySelect}
      />
      {selectedProperty && (
        <PropertyPopup 
          property={selectedProperty} 
          onClose={handlePopupClose}
        />
      )}
    </>
  );
};
