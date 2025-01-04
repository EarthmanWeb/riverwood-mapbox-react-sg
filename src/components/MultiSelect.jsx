import React, { useState } from 'react';
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

  const toggleOption = (optionValue) => {
    const newSelection = selected.includes(optionValue)
      ? selected.filter(item => item !== optionValue)
      : [...selected, optionValue];
    onChange(newSelection);
  };

  const removeOption = (optionToRemove) => {
    const newSelection = selected.filter(option => option !== optionToRemove);
    onChange(newSelection);
  };

  return (
    <div className="multi-select">
      <label className="multi-select-label">{label}</label>
      <button
        type="button"
        className={`multi-select-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length > 0 ? (
          <div className="selected-tokens">
            {selected.map(optionValue => (
              <span key={optionValue} className="selected-token">
                {optionValue}
                <button
                  className="token-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(optionValue);
                  }}
                  aria-label={`Remove ${optionValue}`}
                >
                  <FaTimes size={10} />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className="placeholder">{placeholder}</span>
        )}
        <FaChevronDown className={`icon ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="multi-select-dropdown">
          {options.map(option => (
            <label 
              key={option.value} 
              className={`multi-select-option ${option.count === 0 ? 'text-muted' : ''}`}
            >
              <div className="option-content">
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                />
                <span>{option.label}</span>
              </div>
              <span className={`option-count ${option.count === 0 ? 'text-muted' : ''}`}>
                {option.count}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
