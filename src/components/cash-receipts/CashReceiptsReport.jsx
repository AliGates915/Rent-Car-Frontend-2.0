import { useState, useEffect } from 'react';
import { Download, Printer, Loader } from 'lucide-react';
import api from '../../services/api';

export default function CashReceiptsReport() {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [groupBy, setGroupBy] = useState('day');
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch report data when date range changes
  useEffect(() => {
    fetchReport();
  }, [dateRange.startDate, dateRange.endDate]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('start_date', dateRange.startDate);
      if (dateRange.endDate) params.append('end_date', dateRange.endDate);
      
      const queryString = params.toString();
      const url = `/receipts/report-data${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching from URL:', url);
      
      const response = await api.get(url);
      console.log('Response data:', response.data);
      
      // The response should be an array directly
      if (Array.isArray(response.data)) {
        setReceipts(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setReceipts(response.data.data);
      } else {
        setReceipts([]);
        console.warn('Unexpected response format:', response.data);
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.response?.data?.message || 'Failed to fetch report data');
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearDates = () => {
    setDateRange({ startDate: '', endDate: '' });
  };

  const handleSetCurrentWeek = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const firstDay = new Date(now);
    firstDay.setDate(now.getDate() - currentDay);
    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6);
    
    setDateRange({
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    });
  };

  const handleSetCurrentMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setDateRange({
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    });
  };

  // Get week number helper function
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  // Group data by selected period
  const getGroupedData = () => {
    if (!receipts || receipts.length === 0) return [];
    
    const grouped = {};
    receipts.forEach(receipt => {
      let key;
      const dateValue = receipt.receipt_date || receipt.created_at;
      if (!dateValue) return;
      
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return;
      
      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
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
      if (receipt.payment_method && grouped[key].byMethod.hasOwnProperty(receipt.payment_method)) {
        grouped[key].byMethod[receipt.payment_method] += parseFloat(receipt.amount) || 0;
      }
    });
    
    return Object.values(grouped);
  };

  const groupedData = getGroupedData();
  const totalAmount = receipts?.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0) || 0;
  const cashTotal = receipts?.filter(r => r.payment_method === 'cash').reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0) || 0;
  const bankTotal = receipts?.filter(r => r.payment_method === 'bank').reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0) || 0;
  const easypaisaTotal = receipts?.filter(r => r.payment_method === 'easypaisa').reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0) || 0;
  const jazzcashTotal = receipts?.filter(r => r.payment_method === 'jazzcash').reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0) || 0;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!receipts || receipts.length === 0) return;
    
    const csvData = receipts.map(receipt => ({
      Date: new Date(receipt.receipt_date || receipt.created_at).toLocaleDateString(),
      'Received From': receipt.customer_name || receipt.source || 'General',
      Head: receipt.source === 'booking' ? 'Booking Payment' : 'Customer Payment',
      Amount: receipt.amount,
      'Payment Method': receipt.payment_method?.toUpperCase() || '-',
      'Reference ID': receipt.reference_id || '',
      'Customer ID': receipt.customer_id || '',
      Notes: receipt.notes || ''
    }));
    
    const headers = Object.keys(csvData[0]);
    const csvRows = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => {
        const value = row[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(','))
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cash-receipts-report-${dateRange.startDate || 'all'}-to-${dateRange.endDate || 'all'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={fetchReport}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date (Optional)
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
              End Date (Optional)
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
          <div className="flex items-end gap-2">
            <button
              onClick={handleSetCurrentWeek}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              This Week
            </button>
            <button
              onClick={handleSetCurrentMonth}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              This Month
            </button>
            <button
              onClick={handleClearDates}
              className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleExportCSV}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
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
          <p className="text-2xl font-bold">₨ {cashTotal.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90 mb-1">Bank/Mobile</p>
          <p className="text-2xl font-bold">₨ {(bankTotal + easypaisaTotal + jazzcashTotal).toLocaleString()}</p>
          <p className="text-xs opacity-80 mt-1">
            Bank: ₨ {bankTotal.toLocaleString()} | Mobile: ₨ {(easypaisaTotal + jazzcashTotal).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Grouped Report Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Cash Receipts Report</h3>
          <p className="text-sm text-gray-500 mt-1">
            {dateRange.startDate || dateRange.endDate ? (
              <>
                {dateRange.startDate && `From: ${dateRange.startDate}`}
                {dateRange.startDate && dateRange.endDate && ' to '}
                {dateRange.endDate && `To: ${dateRange.endDate}`}
              </>
            ) : (
              'Showing all receipts (no date filter)'
            )}
            {receipts.length > 0 && ` • Total: ${receipts.length} receipts`}
          </p>
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
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{group.period}</td>
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
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <p className="text-lg mb-2">No receipts found</p>
                      <p className="text-sm">Try adjusting your date range or clear filters to see all receipts</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {groupedData.length > 0 && (
              <tfoot className="bg-gray-50 font-semibold border-t border-gray-200">
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