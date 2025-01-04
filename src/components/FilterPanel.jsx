import React from 'react';
import { FaEye } from 'react-icons/fa';
import { BiReset } from 'react-icons/bi';
import '../styles/components/FilterPanel.css';

const FilterPanel = ({ isOpen, onClose }) => {
  const handleReset = () => {
    // Reset logic will go here
    console.log('Filters reset');
  };

  return (
    <>
      {isOpen && (
        <div className="filter-overlay" onClick={onClose}>
          <div className="filter-panel" onClick={e => e.stopPropagation()}>
            <div className="filter-header">
              <button className="view-results-button" onClick={onClose}>
                <FaEye />
                <span>View Results</span>
              </button>
              <button className="reset-button" onClick={handleReset}>
                <BiReset />
                <span>Reset</span>
              </button>
            </div>
            <div className="filter-title">
              <h2>Filter Properties</h2>
            </div>
            <div className="filter-content">
              {/* Filter controls will go here */}
              <p>Filter controls coming soon...</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterPanel;
