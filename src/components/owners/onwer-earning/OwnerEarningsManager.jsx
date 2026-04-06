// components/owner-earnings/OwnerEarningsManager.jsx
import { useState } from 'react';
import OwnerEarningsList from './OwnerEarningsList';
import OwnerSummary from './OwnerSummary';
import OwnerDuePayments from './OwnerDuePayments';
import OwnerSelector from '../OwnerSelector';

export default function OwnerEarningsManager() {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedEarning, setSelectedEarning] = useState(null);

  const tabs = [
    { key: 'list', label: 'All Earnings' },
    { key: 'summary', label: 'Owner Summary' },
    { key: 'due', label: 'Due Payments' }
  ];

  const handleViewDetails = (earning) => {
    setSelectedEarning(earning);
    // You can open a modal or navigate to details page
    console.log('View details:', earning);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Summary Tab - Requires Owner Selection */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <OwnerSelector 
            onSelect={setSelectedOwner} 
            selectedOwner={selectedOwner}
          />
          {selectedOwner && (
            <OwnerSummary ownerId={selectedOwner.id} />
          )}
        </div>
      )}

      {/* Due Payments Tab */}
      {activeTab === 'due' && (
        <OwnerDuePayments />
      )}

      {/* List Tab */}
      {activeTab === 'list' && (
        <OwnerEarningsList onViewDetails={handleViewDetails} />
      )}
    </div>
  );
}