// frontend/src/components/Setup/SetupTabs.jsx
import React, { useState } from 'react';
import SetupList from './SetupList';
import SetupForm from './SetupForm';

const SetupTabs = ({ config }) => {
  const [activeTab, setActiveTab] = useState('list');

  const tabs = [
    { key: 'list', label: 'List', component: SetupList },
    { key: 'form', label: 'Form', component: SetupForm }
  ];

  const ActiveComponent = tabs.find(tab => tab.key === activeTab)?.component;

  return (
    <div className="setup-module">
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="tab-content">
        {ActiveComponent && <ActiveComponent onEdit={() => setActiveTab('form')} />}
      </div>
    </div>
  );
};

export default SetupTabs;