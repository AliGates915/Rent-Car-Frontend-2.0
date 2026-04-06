// frontend/src/components/setup/SetupTypeSelector.jsx
import React from 'react';

const SetupTypeSelector = ({ types, selectedType, onTypeChange }) => {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {types.map((type) => (
          <button
            key={type.key}
            onClick={() => onTypeChange(type.key)}
            className={`
              whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
              ${selectedType === type.key
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {type.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SetupTypeSelector;