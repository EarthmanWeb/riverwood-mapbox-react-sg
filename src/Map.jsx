// Mapbox import
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
// import "mapboxgl-legend/dist/style.css";
import { MapContext } from "./App";
import "./Map.css";

import { useRef, useEffect, useContext } from "react";
// import ReactDOM from "react-dom/client";
import { useUpdateEffect } from "react-use";

// custom home button
import HomeControl, { homeControlFunctionality } from "./utils/HomeControl";

// add Mapbox API key via env file
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;

import { MockDataService } from './services/MockDataService';
import style from './styles/style.json';  // Update import to use style.json

export const Map = ({ lng, lat, zoom }) => {
  const mapDiv = useRef(null);
  const map = useRef(null);
  const popup = useRef(null); // Add this line near the top with other refs

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
            10, 4,  // smaller at zoom level 10
            16, 8   // larger at zoom level 16
          ],
          'circle-color': '#FF0000',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
          'circle-pitch-alignment': 'map'
        }
      });

      bindLayerEvents();

    } catch (error) {
      console.error('Error adding map layers:', error);
    }
  };

  const bindLayerEvents = () => {
    // Remove existing listeners if any
    map.current.off('click', 'property-points');
    map.current.off('mouseenter', 'property-points');
    map.current.off('mouseleave', 'property-points');

    // Add click handler
    map.current.on('click', 'property-points', (e) => {
      if (!e.features?.[0]) return;
      
      // Remove existing popup
      if (popup.current) {
        popup.current.remove();
      }

      const feature = e.features[0];
      const props = feature.properties;
      const coordinates = feature.geometry.coordinates.slice();

      // Ensure proper popup positioning
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      popup.current = new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(createPopupContent(props, coordinates))
        .addTo(map.current);

    });

    // Mouse interactions
    map.current.on('mouseenter', 'property-points', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'property-points', () => {
      map.current.getCanvas().style.cursor = '';
    });

  };

  const createPopupContent = (props, coordinates) => {
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

    return `
      <div class="property-popup">
        <div class="image-container">
          <div class="loading-placeholder">Loading...</div>
          <img 
            src="${props.image}" 
            alt="${props.title}"
            onload="this.classList.add('loaded'); this.parentElement.querySelector('.loading-placeholder').style.display='none';"
          />
        </div>
        <h3>${props.title}</h3>
        <p>${props.display_address}</p>
        <p><strong>Status:</strong> ${props.status}</p>
        <p><strong>Price:</strong> ${priceRange}</p>
      </div>
    `;
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
      bearing: 0 // Force north orientation
    });

    // Single load event
    map.current.on('load', async () => {
      try {
        const mockDataService = MockDataService.getInstance();
        await mockDataService.loadMockData();
        const geoJsonProperties = mockDataService.getGeoJsonFeatures();

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
        
        // Add navigation control with zoom buttons first
        map.current.addControl(
          new mapboxgl.NavigationControl({
            showCompass: false, // Hide rotation control
            showZoom: true,     // Show zoom controls
            visualizePitch: false
          }),
          'top-right'
        );

        // Add other controls
        map.current.addControl(new mapboxgl.FullscreenControl(), "bottom-left");
        map.current.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true }
          ), 
          "bottom-left"
        );
        map.current.addControl(new HomeControl(), "bottom-left");
        
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

        console.log('Properties loaded and added to map');
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    });

    // Add cleanup function
    return () => {
      if (popup.current) {
        popup.current.remove();
      }
    };
  }, []);

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

  return <div ref={mapDiv} id="mapDiv"></div>;
};
