import React from 'react';
import { FaSearch, FaTimes, FaSearchMinus } from 'react-icons/fa';
import { BiReset } from 'react-icons/bi';
import MultiSelect from './MultiSelect';
import PropTypes from 'prop-types';
const isMobile = window.innerWidth <= 768;
const FilterContent = ({ 
  filters,
  filteredFeatures,
  propertyTypes,
  propertyLabels,
  handleFilterChange,
  handleClearKeyword,
  handleZoomOut,
  canZoomOut,
  handleReset,
  getOptionsWithCounts
}) => {
  return (
    <>
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
          <span>Clear Filters</span>
        </button>
      </div>
      <div className='filter-content' style={{ paddingBottom: isMobile ? '250px' : '10px' }}>
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
          onChange={(value) => handleFilterChange('type', value)}
          placeholder="Select property types..."
          label="Type"
        />

        <MultiSelect
          options={getOptionsWithCounts(propertyLabels, 'labels')}
          selected={filters.labels}
          onChange={(value) => handleFilterChange('labels', value)}
          placeholder="Select property labels..."
          label="Labels"
        />
      </div>
    </>
  );
};
FilterContent.propTypes = {
  filters: PropTypes.object.isRequired,
  filteredFeatures: PropTypes.array.isRequired,
  propertyTypes: PropTypes.array.isRequired,
  propertyLabels: PropTypes.array.isRequired,
  handleFilterChange: PropTypes.func.isRequired,
  handleClearKeyword: PropTypes.func.isRequired,
  handleZoomOut: PropTypes.func.isRequired,
  canZoomOut: PropTypes.func.isRequired,
  handleReset: PropTypes.func.isRequired,
  getOptionsWithCounts: PropTypes.func.isRequired,
};

export default FilterContent;
