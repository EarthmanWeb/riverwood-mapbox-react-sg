import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FaMapMarkedAlt, FaArrowRight } from 'react-icons/fa'; // Remove duplicate imports
import { useSearchParams } from 'react-router-dom';
import '../styles/components/FilterPanel.css';
import { FilterService } from '../services/FilterService';
import { MockDataService } from '../services/MockDataService';
import FilterContent from './FilterContent';

const FilterPanel = ({ isOpen, onClose, visibleFeatures = [], onFiltersChange }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    // Toggle body class for global styling
    document.body.classList.toggle('panel-open', isOpen);
    
    // Handle map resize when panel opens/closes on desktop
    if (!isMobile) {
      const mapContainer = document.querySelector('.map-container');
      if (mapContainer) {
        mapContainer.classList.toggle('panel-open', isOpen);
        // Trigger map resize after transition
        setTimeout(() => {
          if (window.mapInstance) {
            window.mapInstance.resize();
          }
        }, 300);
      }
    }

    // Cleanup
    return () => {
      document.body.classList.remove('panel-open');
    };
  }, [isOpen, isMobile]);

  // Only read from URL
  const filters = useMemo(() => {
    const urlFilters = {
      keyword: searchParams.get('keyword') || '',
      type: searchParams.getAll('type') || [],
      status: searchParams.get('status') || '',
      features: searchParams.getAll('features') || [],
      labels: searchParams.getAll('labels') || []
    };
    // console.log('🔍 FilterPanel: Reading URL filters:', urlFilters);
    return urlFilters;
  }, [searchParams]);

  const [propertyTypes, setPropertyTypes] = useState([]);
  const [propertyLabels, setPropertyLabels] = useState([]);
  const [isClosing, setIsClosing] = useState(false);
  const [allFeatures, setAllFeatures] = useState([]);

  // Load data and apply initial filters once
  useEffect(() => {
    const initializeData = async () => {
      const mockDataService = MockDataService.getInstance();
      if (mockDataService.getData().length === 0) {
        await mockDataService.loadMockData();
      }
      setPropertyTypes(mockDataService.getUniquePropertyTypes());
      setPropertyLabels(mockDataService.getUniquePropertyLabels());
      setAllFeatures(mockDataService.getGeoJsonFeatures());
      
      // Apply initial filters
      onFiltersChange?.(FilterService.cleanFilters(filters));
    };
    initializeData();
  }, []); // Run once on mount

  // Simplified update that only changes URL
  const updateFilters = useCallback((updates) => {
    // console.log('🔍 FilterPanel: UpdateFilters called:', {
    //   current: Object.fromEntries([...searchParams.entries()]),
    //   updates
    // });
    
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      newParams.delete(key);
      if (Array.isArray(value)) {
        value.forEach(v => v && newParams.append(key, v));
      } else if (value) {
        newParams.set(key, value);
      }
    });

    // console.log('🔍 FilterPanel: Setting URL params:', {
    //   params: [...newParams.entries()]
    // });
    
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleFilterChange = useCallback((type, value) => {
    updateFilters({ [type]: value });
  }, [updateFilters]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match transition duration
  };

  const handleReset = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const handleClearKeyword = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('keyword');
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Get current active filters
  const getActiveFilters = () => {
    const activeFilters = {};
    if (filters.keyword) activeFilters.keyword = filters.keyword;
    return activeFilters;
  };

  const handleZoomOut = () => {
    if (window.mapInstance) {
      window.mapInstance.zoomOut();
    }
  };

  const canZoomOut = () => {
    if (!window.mapInstance) return false;
    const currentZoom = window.mapInstance.getZoom();
    const minZoom = window.mapInstance.getMinZoom();
    return currentZoom > minZoom;
  };

  // Memoize filtered features
  const filteredFeatures = useMemo(() => {
    const results = FilterService.getFilteredResults(
      visibleFeatures, 
      FilterService.cleanFilters(filters)
    );
    
    // console.log('🎯 Filtered features result:', {
    //   totalVisible: visibleFeatures?.length,
    //   totalAll: allFeatures?.length,
    //   filtered: results?.length,
    //   activeFilters: Object.keys(filters).filter(k => 
    //     filters[k] && (!Array.isArray(filters[k]) || filters[k].length)
    //   )
    // });
    
    return results;
  }, [visibleFeatures, filters]);

  // Add helper function to calculate counts
  const getOptionsWithCounts = useCallback((options, type) => {
    // console.log('🔍 Getting options with counts:', {
    //   type,
    //   optionsCount: options.length,
    //   currentFilters: filters,
    //   allFeaturesCount: allFeatures?.length,
    //   visibleFeaturesCount: visibleFeatures?.length
    // });

    const optionsWithCounts = FilterService.getOptionsWithCount(
      allFeatures, // Use full dataset for counts
      type,
      options,
      FilterService.cleanFilters(filters)
    );

    // console.log('🔍 Options with counts result:', {
    //   type,
    //   results: optionsWithCounts.map(o => ({ 
    //     label: o.label, 
    //     count: o.count 
    //   }))
    // });

    return optionsWithCounts;
  }, [allFeatures, filters]);

  return (
    <>
      {/* Mobile panel */}
      {isMobile && isOpen && (
        <div className={`filter-overlay ${isClosing ? 'fading-out' : ''}`} onClick={handleClose}>
          <div className={`filter-panel ${isClosing ? 'sliding-out' : ''}`} onClick={e => e.stopPropagation()}>
            <div className="filter-title mt-0 pt-3">
              <h2>Property Filters</h2>
              <button className="view-results-button" onClick={handleClose}>
                <FaMapMarkedAlt />
                <span>View on Map</span>
              </button>
            </div>
            <FilterContent 
              filters={filters}
              filteredFeatures={filteredFeatures}
              propertyTypes={propertyTypes}
              propertyLabels={propertyLabels}
              handleFilterChange={handleFilterChange}
              handleClearKeyword={handleClearKeyword}
              handleZoomOut={handleZoomOut}
              canZoomOut={canZoomOut}
              handleReset={handleReset}
              getOptionsWithCounts={getOptionsWithCounts}
            />
          </div>
        </div>
      )}
      
      {/* Desktop panel */}
      {!isMobile && (
        <div className={`filter-panel ${isOpen ? 'open' : ''}`}>
          <div className="filter-title mt-0 pt-3">
            <h2>Property Filters</h2>
            <button className="view-results-button" onClick={handleClose}>
              <FaArrowRight />
              <span>Hide Filters</span>
            </button>
          </div>
          <FilterContent 
            filters={filters}
            filteredFeatures={filteredFeatures}
            propertyTypes={propertyTypes}
            propertyLabels={propertyLabels}
            handleFilterChange={handleFilterChange}
            handleClearKeyword={handleClearKeyword}
            handleZoomOut={handleZoomOut}
            canZoomOut={canZoomOut}
            handleReset={handleReset}
            getOptionsWithCounts={getOptionsWithCounts}
          />
        </div>
      )}
    </>
  );
};

// Improved debounce with cancel
function debounce(func, wait) {
  let timeout;
  
  const debounced = function(...args) {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };

  debounced.cancel = function() {
    clearTimeout(timeout);
  };

  return debounced;
}
FilterPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  visibleFeatures: PropTypes.array,
  onFiltersChange: PropTypes.func
};

export default React.memo(FilterPanel, (prev, next) => {
  return prev.isOpen === next.isOpen && 
         prev.visibleFeatures === next.visibleFeatures;
});
