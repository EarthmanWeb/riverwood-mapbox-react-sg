import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaEye, FaSearchMinus, FaSearch, FaTimes } from 'react-icons/fa';
import { BiReset } from 'react-icons/bi';
import { useSearchParams, useParams } from 'react-router-dom';
import '../styles/components/FilterPanel.css';
import { FilterService } from '../services/FilterService';
import MultiSelect from './MultiSelect';
import { MockDataService } from '../services/MockDataService';

const FilterPanel = ({ isOpen, onClose, visibleFeatures = [], onFiltersChange }) => {
  const [searchParams, setSearchParams] = useSearchParams();

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
      {isOpen && (
        <div className={`filter-overlay ${isClosing ? 'fading-out' : ''}`} onClick={handleClose}>
          <div className={`filter-panel ${isClosing ? 'sliding-out' : ''}`} onClick={e => e.stopPropagation()}>
            <div className="filter-title mt-0 pt-3">
              <h2 className="mt-0 pt-0">Property Filters</h2>
              <button className="view-results-button" onClick={handleClose}>
                <FaEye />
                <span>View Results</span>
              </button>
            </div>
            <div className="filter-header">
              <div className="filter-header-left">
                <div className="results-count">
                  {filteredFeatures.length > 0 ? (
                    <>
                      {`${filteredFeatures.length} `}
                      {Object.keys(filters).some(key => filters[key] && (!Array.isArray(filters[key]) || filters[key].length > 0)) ? (
                        <><span className="highlight px-1">filtered</span> result(s) in visible area</>
                      ) : (
                        'results in visible area'
                      )}
                    </>
                  ) : canZoomOut() ? (
                    <button className="zoom-out-link" onClick={handleZoomOut}>
                      <FaSearchMinus />
                      <span>Zoom out to find more</span>
                    </button>
                  ) : (
                    'No results in visible area'
                  )}
                </div>
              </div>
              <button 
                className={`reset-button ${Object.keys(filters).some(key => filters[key] && (!Array.isArray(filters[key]) || filters[key].length > 0)) ? 'active' : ''}`} 
                onClick={handleReset}
              >
                <BiReset />
                <span>Remove Filters</span>
              </button>
            </div>
            <div className="filter-content">
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by keyword..."
                  value={filters.keyword}
                  onChange={(e) => handleFilterChange('keyword', e.target.value)}
                  className="search-input"
                />
                <button 
                  className={`search-clear ${filters.keyword ? 'visible' : ''}`}
                  onClick={handleClearKeyword}
                  aria-label="Clear search"
                >
                  <FaTimes size={12} />
                </button>
              </div>
              
              <MultiSelect
                options={getOptionsWithCounts(propertyTypes, 'type')}
                selected={filters.type}
                onChange={(value) => {
                //   console.log('Type selection changed:', value);
                  handleFilterChange('type', value);
                }}
                placeholder="Select property types..."
                label="Type"
              />

              <MultiSelect
                options={getOptionsWithCounts(propertyLabels, 'labels')}
                selected={filters.labels}
                onChange={(value) => {
                //   console.log('Label selection changed:', value);
                  handleFilterChange('labels', value);
                }}
                placeholder="Select property labels..."
                label="Labels"
              />

              {/* Additional filter controls */}
            </div>
          </div>
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

export default React.memo(FilterPanel, (prev, next) => {
  return prev.isOpen === next.isOpen && 
         prev.visibleFeatures === next.visibleFeatures;
});
