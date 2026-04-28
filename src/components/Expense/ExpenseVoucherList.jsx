import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, Search, Plus, Calendar, Download, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import expenseVoucherService from '../../services/expenseVoucher.service';
import ExpenseVoucherForm from './ExpenseVoucherForm';

export default function ExpenseVoucherList() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [summary, setSummary] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch expenses
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await expenseVoucherService.getAll();
      setExpenses(data);
      
      // Fetch summary
      const summaryData = await expenseVoucherService.getSummary(selectedYear);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedYear]);

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await expenseVoucherService.delete(id);
      toast.success('Expense deleted successfully');
      fetchExpenses();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  // Handle edit
  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setShowForm(true);
  };

  // Handle form success
  const handleFormSuccess = () => {
    fetchExpenses();
    setShowForm(false);
    setSelectedExpense(null);
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(expense =>
    expense.expense_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.amount?.toString().includes(searchTerm)
  );

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Calculate total
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Expense Type', 'Vendor Name', 'Amount', 'Notes'];
    const csvData = filteredExpenses.map(expense => [
      expense.id,
      formatDate(expense.created_at),
      expense.expense_type,
      expense.vendor_name || '',
      expense.amount,
      expense.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
            <p className="text-sm opacity-90">Total Expenses</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.grand_total)}</p>
            <p className="text-xs opacity-75">All time total</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
            <p className="text-sm opacity-90">Total Transactions</p>
            <p className="text-2xl font-bold">{summary.summary?.reduce((sum, item) => sum + item.total_count, 0) || 0}</p>
            <p className="text-xs opacity-75">Number of expenses</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <p className="text-sm opacity-90">Average Expense</p>
            <p className="text-2xl font-bold">
              {formatCurrency((summary.grand_total / (summary.summary?.reduce((sum, item) => sum + item.total_count, 0) || 1)))}
            </p>
            <p className="text-xs opacity-75">Per transaction average</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Expense Vouchers</h2>
          <p className="text-sm text-gray-500">Manage and track all business expenses</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() => {
              setSelectedExpense(null);
              setShowForm(true);
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            New Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by type, vendor, notes or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {[2023, 2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <button
            onClick={fetchExpenses}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Showing {filteredExpenses.length} expenses</span>
        <span className="text-sm font-semibold text-gray-900">Total: {formatCurrency(totalAmount)}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Expense Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vendor</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No expenses found
                </td>
              </tr>
            ) : (
              filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">#{expense.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(expense.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      {expense.expense_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{expense.vendor_name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {expense.notes || '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(expense.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ExpenseVoucherForm
          expense={selectedExpense}
          onClose={() => {
            setShowForm(false);
            setSelectedExpense(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}