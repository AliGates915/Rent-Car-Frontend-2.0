import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import expenseVoucherService from '../../services/expenseVoucher.service';

const EXPENSE_HEADS = [
  'Fuel',
  'Maintenance',
  'Repair',
  'Insurance',
  'Tax',
  'Salary',
  'Rent',
  'Utilities',
  'Office Supplies',
  'Marketing',
  'Travel',
  'Training',
  'Software',
  'Other'
];

const PAYMENT_METHODS = ['cash', 'bank', 'easypaisa', 'jazzcard'];

export default function ExpenseVoucherForm({ expense, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    amount: '',
    expense_type: '',
    vendor_name: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount || '',
        expense_type: expense.expense_type || '',
        vendor_name: expense.vendor_name || '',
        notes: expense.notes || '',
      });
    }
  }, [expense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.amount) {
      toast.error('Amount is required');
      return;
    }
    if (!formData.expense_type) {
      toast.error('Expense type is required');
      return;
    }
    if (parseFloat(formData.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      if (expense) {
        await expenseVoucherService.update(expense.id, formData);
        toast.success('Expense updated successfully');
      } else {
        await expenseVoucherService.create(formData);
        toast.success('Expense created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error(error.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">
            {expense ? 'Edit Expense' : 'New Expense'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter amount"
              required
            />
          </div>

          {/* Expense Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expense Type <span className="text-red-500">*</span>
            </label>
            <select
              name="expense_type"
              value={formData.expense_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select expense type</option>
              {EXPENSE_HEADS.map(head => (
                <option key={head} value={head}>{head}</option>
              ))}
            </select>
          </div>

          {/* Vendor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Name
            </label>
            <input
              type="text"
              name="vendor_name"
              value={formData.vendor_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter vendor name"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Additional notes..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {expense ? 'Update' : 'Save'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}