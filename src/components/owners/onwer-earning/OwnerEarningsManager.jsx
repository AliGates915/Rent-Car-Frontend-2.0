// components/owner-earnings/OwnerEarningsManager.jsx
import { useState } from 'react';
import OwnerEarningsList from './OwnerEarningsList';
import OwnerSummary from './OwnerSummary';
import OwnerDuePayments from './OwnerDuePayments';
import OwnerSelector from '../OwnerSelector';
import { moduleApi } from '../../../services/api';
import toast from 'react-hot-toast';

export default function OwnerEarningsManager() {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedEarning, setSelectedEarning] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  const handleMarkAsPaid = async (earningId, amount) => {
    try {
      await moduleApi.patch(`/owner-earnings/${earningId}/pay`, { amount });
      toast.success('Payment recorded successfully');
      // Refresh the list
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Owner Earnings Management</h1>
        <p className="text-purple-100 mt-1">Track and manage owner payouts and commissions</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white rounded-t-xl">
        <nav className="flex gap-6 px-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-1 pt-4 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-b-xl shadow-sm p-6">
        {/* Summary Tab - Requires Owner Selection */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Select an owner to view their financial summary including total earnings, paid amount, and pending dues.
              </p>
            </div>
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
          <OwnerDuePayments onMarkAsPaid={handleMarkAsPaid} />
        )}

        {/* List Tab */}
        {activeTab === 'list' && (
          <OwnerEarningsList onViewDetails={handleViewDetails} onMarkAsPaid={handleMarkAsPaid} />
        )}
      </div>

      {/* Payment Modal (Optional) */}
      {showPaymentModal && selectedEarning && (
        <PaymentModal
          earning={selectedEarning}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handleMarkAsPaid}
        />
      )}
    </div>
  );
}

// Payment Modal Component
const PaymentModal = ({ earning, onClose, onConfirm }) => {
  const [amount, setAmount] = useState(earning?.owner_amount || 0);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(earning.id, amount, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Record Owner Payment</h3>
          <p className="text-sm text-gray-500 mt-1">
            Booking: {earning.booking_code}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              step="100"
              min="0"
              max={earning.owner_amount}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Payment reference, cheque number, etc."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};