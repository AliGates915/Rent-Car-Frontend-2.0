import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, Download } from 'lucide-react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../services/api';
import { toast } from 'sonner';

export default function DaybookReport() {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        fetchDaybook();
    }, [selectedDate]);

    const fetchDaybook = async () => {
        setLoading(true);
        try {
            // Use direct API call with date parameter only - NO pagination
            const params = {
                date: format(selectedDate, 'yyyy-MM-dd')
            };

            console.log('Fetching daybook with params:', params);
            const response = await api.get('/reports/daybook', { params });
            console.log('Daybook data:', response.data);
            setReportData(response.data);
        } catch (error) {
            console.error('Error fetching daybook:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch daybook');
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
            // Convert to CSV
            const entries = reportData.entries || [];
            const csvRows = [
                ['Date', 'Type', 'Description', 'Reference', 'Debit', 'Credit', 'Balance']
            ];

            entries.forEach(entry => {
                csvRows.push([
                    format(new Date(entry.entry_date), 'dd/MM/yyyy'),
                    entry.entry_type,
                    entry.description || '',
                    entry.reference || '',
                    entry.debit.toString(),
                    entry.credit.toString(),
                    entry.balance.toString()
                ]);
            });

            const csvContent = csvRows.map(row => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `daybook-${format(selectedDate, 'yyyy-MM-dd')}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Report exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export report');
        }
    };

    const renderContent = () => {
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
                    No data available for the selected date
                </div>
            );
        }

        const { date, entries, total_debit, total_credit, closing_balance } = reportData;

        if (!entries || entries.length === 0) {
            return (
                <div className="text-center text-gray-500 py-12">
                    No entries found for {format(new Date(date), 'dd MMM yyyy')}
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-blue-600 font-medium">Total Debit</p>
                        <p className="text-2xl font-bold text-blue-700">Rs.{total_debit?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <p className="text-sm text-orange-600 font-medium">Total Credit</p>
                        <p className="text-2xl font-bold text-orange-700">Rs.{total_credit?.toLocaleString() || 0}</p>
                    </div>
                    <div className={`rounded-lg p-4 border ${closing_balance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <p className={`text-sm font-medium ${closing_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>Closing Balance</p>
                        <p className={`text-2xl font-bold ${closing_balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            Rs.{closing_balance?.toLocaleString() || 0}
                        </p>
                    </div>
                </div>

                {/* Daybook Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Reference</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Debit (Rs.)</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Credit (Rs.)</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Balance (Rs.)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {entries.map((entry, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {format(new Date(entry.entry_date), 'dd MMM yyyy')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${entry.entry_type === 'payment' || entry.entry_type === 'receipt'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                            {entry.entry_type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {entry.description || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {entry.reference || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                        Rs.{entry.debit?.toLocaleString() || 0}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                        Rs.{entry.credit?.toLocaleString() || 0}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                                        Rs.{entry.balance?.toLocaleString() || 0}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t border-gray-200">
                            <tr>
                                <td colSpan="4" className="px-4 py-3 text-right font-semibold text-gray-900">Total:</td>
                                <td className="px-4 py-3 text-right font-semibold text-blue-600">
                                    Rs.{total_debit?.toLocaleString() || 0}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-orange-600">
                                    Rs.{total_credit?.toLocaleString() || 0}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                    Rs.{closing_balance?.toLocaleString() || 0}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header with Date Picker */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Daybook Report</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            View all ledger entries for a specific date
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-gray-400" />
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                dateFormat="dd/MM/yyyy"
                            />
                        </div>

                        <button
                            onClick={handleExport}
                            disabled={!reportData}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={16} />
                            Export CSV
                        </button>

                        <button
                            onClick={fetchDaybook}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {renderContent()}
            </div>
        </div>
    );
}