import React, { useState, useEffect } from 'react';
import { FaEye, FaSearchMinus, FaSearch, FaTimes } from 'react-icons/fa';
import { BiReset } from 'react-icons/bi';
import { useSearchParams, useParams } from 'react-router-dom';
import '../styles/components/FilterPanel.css';
import { FilterService } from '../services/FilterService';

const FilterPanel = ({ isOpen, onClose, visibleFeatures = [], onFiltersChange }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams(); // Add this line
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    type: searchParams.getAll('type') || [],
    status: searchParams.get('status') || '',
    features: searchParams.getAll('features') || []
  });
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match transition duration
  };

  // Update filters while preserving route
  const updateFilters = (newFilters) => {
    console.log('FilterPanel updateFilters:', {
      before: filters,
      new: newFilters,
      cleaned: FilterService.cleanFilters(newFilters)
    });

    const cleanFilters = FilterService.cleanFilters(newFilters);
    
    // Update URL parameters
    setSearchParams(
      Object.entries(cleanFilters).flatMap(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map(v => [key, v]);
        }
        return [[key, value]];
      }),
      { replace: true }
    );
    
    onFiltersChange?.(cleanFilters);
  };

  const handleReset = () => {
    setFilters({
      keyword: '',
      type: [],
      status: '',
      features: []
    });
    updateFilters({});
  };

  const handleFilterChange = (type, value) => {
    const newFilters = { ...filters, [type]: value };
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  const handleClearKeyword = () => {
    const newFilters = { ...filters, keyword: '' };
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  // Get current active filters
  const getActiveFilters = () => {
    const filters = {};
    if (filters.keyword) filters.keyword = filters.keyword;
    return filters;
  };

  // Apply filters from URL whenever searchParams changes
  useEffect(() => {
    const urlKeyword = searchParams.get('keyword');
    if (urlKeyword !== filters.keyword) {
      setFilters({ ...filters, keyword: urlKeyword || '' });
      onFiltersChange?.(getActiveFilters());
    }
  }, [searchParams]);

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

  const filteredFeatures = visibleFeatures.filter(feature => {
    const searchText = `${feature.properties.title} ${feature.properties.description}`.toLowerCase();
    return !filters.keyword || searchText.includes(filters.keyword.toLowerCase());
  });

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
              {/* Additional filter controls will go here */}
              <p className='text-muted'>More Filters coming soon...</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterPanel;
