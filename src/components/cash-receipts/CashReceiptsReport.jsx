// frontend/src/components/cash-receipts/CashReceiptsReport.jsx
import { useState } from 'react';
import { Calendar, Download, Printer } from 'lucide-react';
import useFetch from '../../hooks/useFetch';

export default function CashReceiptsReport() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [groupBy, setGroupBy] = useState('day'); // day, week, month

  const { data: receipts, loading } = useFetch('/cash-receipts', {
    start_date: dateRange.startDate,
    end_date: dateRange.endDate
  });

  // Group data by selected period
  const getGroupedData = () => {
    if (!receipts) return [];
    
    const grouped = {};
    receipts.forEach(receipt => {
      let key;
      const date = new Date(receipt.receipt_date);
      
      if (groupBy === 'day') {
        key = receipt.receipt_date;
      } else if (groupBy === 'week') {
        const weekNumber = getWeekNumber(date);
        key = `Week ${weekNumber}, ${date.getFullYear()}`;
      } else {
        key = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      }
      
      if (!grouped[key]) {
        grouped[key] = {
          period: key,
          count: 0,
          total: 0,
          byMethod: { cash: 0, bank: 0, easypaisa: 0, jazzcash: 0 }
        };
      }
      
      grouped[key].count++;
      grouped[key].total += parseFloat(receipt.amount) || 0;
      grouped[key].byMethod[receipt.payment_method] += parseFloat(receipt.amount) || 0;
    });
    
    return Object.values(grouped);
  };

  const groupedData = getGroupedData();
  const totalAmount = receipts?.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group By
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90 mb-1">Total Receipts</p>
          <p className="text-2xl font-bold">{receipts?.length || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90 mb-1">Total Amount</p>
          <p className="text-2xl font-bold">₨ {totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90 mb-1">Average Receipt</p>
          <p className="text-2xl font-bold">₨ {receipts?.length ? (totalAmount / receipts.length).toFixed(2) : 0}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90 mb-1">Cash Payments</p>
          <p className="text-2xl font-bold">₨ {receipts?.filter(r => r.payment_method === 'cash').reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0).toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90 mb-1">Bank Transfers</p>
          <p className="text-2xl font-bold">₨ {receipts?.filter(r => r.payment_method === 'bank').reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Grouped Report Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Cash Receipts Report</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cash</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">EasyPaisa</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">JazzCash</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {groupedData.map((group, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{group.period}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">{group.count}</td>
                  <td className="px-6 py-4 text-sm text-green-600 text-right">₨ {group.byMethod.cash.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-purple-600 text-right">₨ {group.byMethod.bank.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-orange-600 text-right">₨ {group.byMethod.easypaisa.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-red-600 text-right">₨ {group.byMethod.jazzcash.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">₨ {group.total.toLocaleString()}</td>
                </tr>
              ))}
              {groupedData.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No receipts found for the selected period
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
            {groupedData.length > 0 && (
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td className="px-6 py-3 text-sm text-gray-900">Total</td>
                  <td className="px-6 py-3 text-sm text-gray-900 text-right">{groupedData.reduce((sum, g) => sum + g.count, 0)}</td>
                  <td className="px-6 py-3 text-sm text-green-700 text-right">₨ {groupedData.reduce((sum, g) => sum + g.byMethod.cash, 0).toLocaleString()}</td>
                  <td className="px-6 py-3 text-sm text-purple-700 text-right">₨ {groupedData.reduce((sum, g) => sum + g.byMethod.bank, 0).toLocaleString()}</td>
                  <td className="px-6 py-3 text-sm text-orange-700 text-right">₨ {groupedData.reduce((sum, g) => sum + g.byMethod.easypaisa, 0).toLocaleString()}</td>
                  <td className="px-6 py-3 text-sm text-red-700 text-right">₨ {groupedData.reduce((sum, g) => sum + g.byMethod.jazzcash, 0).toLocaleString()}</td>
                  <td className="px-6 py-3 text-sm text-gray-900 text-right">₨ {groupedData.reduce((sum, g) => sum + g.total, 0).toLocaleString()}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}