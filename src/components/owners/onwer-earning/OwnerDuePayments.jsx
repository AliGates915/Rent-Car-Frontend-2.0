// components/owner-earnings/OwnerDuePayments.jsx
import useFetch from '../../../hooks/useFetch';
import { DollarSign, AlertCircle, RefreshCw, CreditCard, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { moduleApi } from '../../../services/api';
import toast from 'react-hot-toast';

export default function OwnerDuePayments() {
  const { data: dueReports, loading, refetch } = useFetch('/owner-earnings/due-report');
  const [processing, setProcessing] = useState(null);

  const handleMarkAllAsPaid = async (ownerId) => {
    if (!confirm('Mark all unpaid earnings for this owner as paid?')) return;
    
    setProcessing(ownerId);
    try {
      // You might need a bulk update endpoint
      const unpaidEarnings = dueReports?.find(r => r.owner_id === ownerId)?.earnings || [];
      for (const earning of unpaidEarnings) {
        await moduleApi.patch(`/owner-earnings/mark-paid/${earning.id}`, {});
      }
      toast.success('All earnings marked as paid');
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as paid');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!dueReports || dueReports.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <CheckCircle size={48} className="mx-auto text-green-400 mb-3" />
        <p className="text-gray-500">No pending due payments</p>
        <p className="text-sm text-gray-400 mt-1">All owner earnings have been paid</p>
      </div>
    );
  }

  const totalDue = dueReports.reduce((sum, report) => sum + parseFloat(report.total_unpaid_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Total Due Summary */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100">Total Due Payments</p>
            <p className="text-3xl font-bold mt-1">Rs.{totalDue.toLocaleString()}</p>
          </div>
          <DollarSign size={48} className="text-red-300" />
        </div>
      </div>

      {/* Due Reports List */}
      <div className="space-y-4">
        {dueReports.map((report) => (
          <div key={report.owner_id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{report.owner_name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {report.total_unpaid_bookings} unpaid {report.total_unpaid_bookings === 1 ? 'booking' : 'bookings'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">
                    Rs.{parseFloat(report.total_unpaid_amount).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleMarkAllAsPaid(report.owner_id)}
                    disabled={processing === report.owner_id}
                    className="mt-2 text-sm bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {processing === report.owner_id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <CreditCard size={14} />
                    )}
                    Mark All as Paid
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => refetch()}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>
    </div>
  );
}