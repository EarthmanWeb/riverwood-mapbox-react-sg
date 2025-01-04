import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaTimes } from 'react-icons/fa';
import '../styles/components/MultiSelect.css';

const MultiSelect = ({ 
  options, 
  selected, 
  onChange, 
  placeholder,
  label 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    const newSelection = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];
    onChange(newSelection);
  };

  const removeOption = (optionToRemove) => {
    const newSelection = selected.filter(option => option !== optionToRemove);
    onChange(newSelection);
  };

  return (
    <div className="multi-select" ref={dropdownRef}>
      <label className="multi-select-label">{label}</label>
      <button
        type="button"
        className={`multi-select-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {selected.length 
            ? `${selected.length} selected`
            : placeholder}
        </span>
        <FaChevronDown className={`icon ${isOpen ? 'open' : ''}`} />
      </button>
      
      {selected.length > 0 && (
        <div className="selected-tokens">
          {selected.map(option => (
            <span key={option} className="selected-token">
              {option}
              <button
                className="token-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  removeOption(option);
                }}
                aria-label={`Remove ${option}`}
              >
                <FaTimes size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="multi-select-dropdown">
          {options.map(option => (
            <label key={option} className="multi-select-option">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
