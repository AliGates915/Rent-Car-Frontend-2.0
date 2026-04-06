// components/owner-earnings/OwnerEarningsList.jsx
import { useState } from 'react';
import useFetch from '../../../hooks/useFetch';
import { moduleApi } from '../../../services/api';
import toast from 'react-hot-toast';
import { Eye, DollarSign, CheckCircle, Clock, AlertCircle, RefreshCw, Download, IndianRupee, IndianRupeeIcon } from 'lucide-react';

export default function OwnerEarningsList({ onViewDetails }) {
  const { data: earnings, loading, refetch } = useFetch('/owner-earnings');
  const [markingPaid, setMarkingPaid] = useState(null);

  const handleMarkPaid = async (id) => {
    if (!confirm('Mark this earning as paid?')) return;
    
    setMarkingPaid(id);
    try {
      await moduleApi.patch(`/owner-earnings/mark-paid/${id}`, {});
      toast.success('Earning marked as paid');
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as paid');
    } finally {
      setMarkingPaid(null);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle size={12} />
          Paid
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        <Clock size={12} />
        Unpaid
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Owner Earnings</h2>
        <button
          onClick={() => refetch()}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {!earnings || earnings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="mx-auto text-gray-400 mb-3 text-4xl" >Rs.</div>
          <p className="text-gray-500">No earnings records found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Owner</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Booking Code</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Booking Amount</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Owner %</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Owner Amount</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {earnings.map((earning) => (
                  <tr key={earning.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">#{earning.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{earning.owner_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {earning.registration_no} - {earning.car_make} {earning.car_model}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 font-mono">{earning.booking_code}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        Rs.{parseFloat(earning.booking_amount).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm text-gray-600">{earning.owner_percentage}%</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-semibold text-green-600">
                        Rs.{parseFloat(earning.owner_amount).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(earning.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onViewDetails?.(earning)}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {earning.status === 'unpaid' && (
                          <button
                            onClick={() => handleMarkPaid(earning.id)}
                            disabled={markingPaid === earning.id}
                            className="text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
                            title="Mark as Paid"
                          >
                            {markingPaid === earning.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
                            ) : (
                              <CheckCircle size={18} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}