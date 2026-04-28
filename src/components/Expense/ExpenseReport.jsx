import React, { useState } from 'react';
import { Calendar, Download, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import expenseVoucherService from '../services/expenseVoucher.service';

export default function ExpenseReport() {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast.error('Please select both from and to dates');
      return;
    }

    setLoading(true);
    try {
      const data = await expenseVoucherService.getReport(dateRange.from, dateRange.to);
      setReport(data);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={fetchReport}
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90">Total Expenses</p>
              <p className="text-2xl font-bold">{report.summary.total_expenses}</p>
              <p className="text-xs opacity-75">Number of transactions</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90">Total Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(report.summary.total_amount)}</p>
              <p className="text-xs opacity-75">Total expenditure</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90">Average</p>
              <p className="text-2xl font-bold">
                {formatCurrency(report.summary.total_amount / (report.summary.total_expenses || 1))}
              </p>
              <p className="text-xs opacity-75">Per transaction</p>
            </div>
          </div>

          {/* Expense by Type */}
          {Object.keys(report.summary.by_type).length > 0 && (
            <div className="bg-white rounded-xl border">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Expenses by Type</h3>
              </div>
              <div className="divide-y">
                {Object.entries(report.summary.by_type).map(([type, data]) => (
                  <div key={type} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{type}</p>
                      <p className="text-sm text-gray-500">{data.count} transactions</p>
                    </div>
                    <p className="font-semibold text-red-600">{formatCurrency(data.total)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Expenses */}
          <div className="bg-white rounded-xl border">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Recent Expenses</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm">Date</th>
                    <th className="px-4 py-3 text-left text-sm">Type</th>
                    <th className="px-4 py-3 text-left text-sm">Vendor</th>
                    <th className="px-4 py-3 text-right text-sm">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.expenses.slice(0, 10).map(expense => (
                    <tr key={expense.id}>
                      <td className="px-4 py-3 text-sm">{new Date(expense.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">{expense.expense_type}</td>
                      <td className="px-4 py-3 text-sm">{expense.vendor_name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                        {formatCurrency(expense.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}