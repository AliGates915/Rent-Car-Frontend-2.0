// frontend/src/pages/ReportsPage.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Calendar, Download, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../services/api';
import { toast } from 'sonner';
import DaybookReport from '../components/reports/DaybookReport'; // Import the component

export default function ReportsPage({ activeReport: propActiveReport }) {
  const [activeReport, setActiveReport] = useState(propActiveReport || 'profit-loss');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)),
    endDate: new Date(),
  });

  useEffect(() => {
    if (activeReport !== 'daybook') {
      fetchReport();
    }
  }, [activeReport, dateRange.startDate, dateRange.endDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let params = {};
      
      switch(activeReport) {
        case 'profit-loss':
          endpoint = '/reports/profit-loss';
          params = {
            from: format(dateRange.startDate, 'yyyy-MM-dd'),
            to: format(dateRange.endDate, 'yyyy-MM-dd')
          };
          break;
        case 'expense':
          endpoint = '/reports/expense';
          params = {
            from: format(dateRange.startDate, 'yyyy-MM-dd'),
            to: format(dateRange.endDate, 'yyyy-MM-dd')
          };
          break;
        case 'receipt':
          endpoint = '/reports/receipt';
          params = {
            from: format(dateRange.startDate, 'yyyy-MM-dd'),
            to: format(dateRange.endDate, 'yyyy-MM-dd')
          };
          break;
      }
  
      if (endpoint) {
        console.log('Fetching report:', endpoint, params);
        const response = await api.get(endpoint, { params });
        setReportData(response.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!reportData) {
      toast.error('No data to export');
      return;
    }
    
    try {
      const jsonStr = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeReport}-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  const renderReportContent = () => {
    // If daybook, use the imported Daybook component
    if (activeReport === 'daybook') {
      return <DaybookReport />;
    }

    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!reportData) {
      return (
        <div className="text-center text-gray-500 py-12">
          No data available for the selected period
        </div>
      );
    }

    switch (activeReport) {
      case 'profit-loss':
        return <ProfitLossReport data={reportData} />;
      case 'expense':
        return <ExpenseReport data={reportData} />;
      case 'receipt':
        return <ReceiptReport data={reportData} />;
      default:
        return <DefaultReport data={reportData} />;
    }
  };

  const showDateRange = activeReport !== 'daybook';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {activeReport === 'profit-loss' ? 'Profit & Loss' : 
               activeReport === 'daybook' ? 'Daybook' :
               activeReport === 'expense' ? 'Expense Report' : 'Receipt Report'}
            </h2>
            {showDateRange && (
              <p className="text-sm text-gray-500 mt-1">
                {format(dateRange.startDate, 'dd MMM yyyy')} - {format(dateRange.endDate, 'dd MMM yyyy')}
              </p>
            )}
          </div>
          
          {showDateRange && (
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-gray-400" />
                <DatePicker
                  selectsRange={true}
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  onChange={(update) => {
                    setDateRange({
                      startDate: update[0] || dateRange.startDate,
                      endDate: update[1] || dateRange.endDate,
                    });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
              
              <button
                onClick={handleExport}
                disabled={!reportData}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <Download size={16} />
                Export
              </button>
              
              <button
                onClick={fetchReport}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {renderReportContent()}
      </div>
    </div>
  );
}

// ProfitLossReport component
function ProfitLossReport({ data }) {
  const { total_income, total_expense, net_profit, breakdown } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600 font-medium">Total Income</p>
          <p className="text-2xl font-bold text-green-700">₹{total_income?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-sm text-red-600 font-medium">Total Expenses</p>
          <p className="text-2xl font-bold text-red-700">₹{total_expense?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Net Profit/Loss</p>
          <p className={`text-2xl font-bold ${net_profit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            ₹{net_profit?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {breakdown && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Income Breakdown</h3>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr><th className="px-4 py-2 text-left">Category</th><th className="px-4 py-2 text-right">Amount</th></tr>
              </thead>
              <tbody>
                <tr className="border-t"><td className="px-4 py-2">Payments</td><td className="px-4 py-2 text-right">₹{breakdown?.payments?.toLocaleString() || 0}</td></tr>
                <tr className="border-t"><td className="px-4 py-2">Receipts</td><td className="px-4 py-2 text-right">₹{breakdown?.receipts?.toLocaleString() || 0}</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Expense Breakdown</h3>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr><th className="px-4 py-2 text-left">Category</th><th className="px-4 py-2 text-right">Amount</th></tr>
              </thead>
              <tbody>
                <tr className="border-t"><td className="px-4 py-2">Expenses</td><td className="px-4 py-2 text-right">₹{breakdown?.expenses?.toLocaleString() || 0}</td></tr>
                <tr className="border-t"><td className="px-4 py-2">Maintenance</td><td className="px-4 py-2 text-right">₹{breakdown?.maintenance?.toLocaleString() || 0}</td></tr>
                <tr className="border-t"><td className="px-4 py-2">Owner Payout</td><td className="px-4 py-2 text-right">₹{breakdown?.owner_payout?.toLocaleString() || 0}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ExpenseReport component
function ExpenseReport({ data }) {
  const expenses = Array.isArray(data) ? data : [];
  const total = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

  if (expenses.length === 0) {
    return <div className="text-center text-gray-500 py-12">No expense records found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-sm text-gray-600">Total Expenses</p><p className="text-2xl font-bold text-red-600">₹{total.toLocaleString()}</p></div>
          <div><p className="text-sm text-gray-600">Number of Transactions</p><p className="text-2xl font-bold text-gray-800">{expenses.length}</p></div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{format(new Date(expense.created_at), 'dd MMM yyyy')}</td>
                <td className="px-4 py-2">{expense.category || 'General'}</td>
                <td className="px-4 py-2">{expense.description || expense.remarks || '-'}</td>
                <td className="px-4 py-2 text-right font-medium">₹{Number(expense.amount || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ReceiptReport component
function ReceiptReport({ data }) {
  const receipts = Array.isArray(data) ? data : [];
  const total = receipts.reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0);

  if (receipts.length === 0) {
    return <div className="text-center text-gray-500 py-12">No receipt records found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-sm text-gray-600">Total Receipts</p><p className="text-2xl font-bold text-green-600">₹{total.toLocaleString()}</p></div>
          <div><p className="text-sm text-gray-600">Number of Receipts</p><p className="text-2xl font-bold text-gray-800">{receipts.length}</p></div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Receipt No.</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Customer Name</th>
              <th className="px-4 py-2 text-left">Payment Method</th>
              <th className="px-4 py-2 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((receipt, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-sm">{receipt.receipt_no || receipt.id}</td>
                <td className="px-4 py-2">{format(new Date(receipt.created_at), 'dd MMM yyyy')}</td>
                <td className="px-4 py-2">{receipt.customer_name || receipt.customerName || '-'}</td>
                <td className="px-4 py-2">{receipt.payment_method || receipt.paymentMethod || 'Cash'}</td>
                <td className="px-4 py-2 text-right font-medium">₹{Number(receipt.amount || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// DefaultReport component
function DefaultReport({ data }) {
  return (
    <div className="overflow-x-auto">
      <pre className="bg-gray-50 p-4 rounded-lg text-sm">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}