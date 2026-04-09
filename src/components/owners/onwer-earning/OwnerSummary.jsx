// components/owner-earnings/OwnerSummary.jsx
import { useState, useEffect } from 'react';
import { DollarSign, Car, Calendar, TrendingUp, Clock, CheckCircle, Percent, Wallet } from 'lucide-react';
import { moduleApi } from '../../../services/api';
import toast from 'react-hot-toast';

export default function OwnerSummary({ ownerId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ownerId) return;

    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await moduleApi.getOne('/owner-earnings/summary', ownerId);
        console.log('Summary API Response:', response);
        
        // Handle different response structures
        let summaryData = response.data || response;
        setSummary(summaryData);
      } catch (err) {
        console.error('Error fetching summary:', err);
        setError(err.response?.data?.message || 'Failed to load summary');
        toast.error('Failed to load owner summary');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [ownerId]);

  if (!ownerId) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <Car className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">Select an owner to view financial summary</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-xl">
        <p className="text-red-600">Error loading summary: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <p className="text-gray-500">No data available for this owner</p>
      </div>
    );
  }

  // Calculate owner percentage if not provided
  const totalBookingAmount = parseFloat(summary.total_booking_amount || 0);
  const totalOwnerAmount = parseFloat(summary.total_owner_amount || 0);
  const ownerPercentage = summary.owner_percentage || 
    (totalBookingAmount > 0 ? (totalOwnerAmount / totalBookingAmount * 100) : 80);
  const companyPercentage = 100 - ownerPercentage;

  const stats = [
    {
      label: 'Total Vehicles',
      value: summary.total_vehicles || 0,
      icon: Car,
      color: 'blue',
      suffix: ''
    },
    {
      label: 'Completed Bookings',
      value: summary.completed_paid_bookings || 0,
      icon: Calendar,
      color: 'purple',
      suffix: 'bookings'
    },
    {
      label: 'Total Booking Amount',
      value: `Rs. ${totalBookingAmount.toLocaleString()}`,
      icon: TrendingUp,
      color: 'orange',
      suffix: ''
    },
    {
      label: 'Owner Share',
      value: `Rs. ${totalOwnerAmount.toLocaleString()}`,
      icon: Percent,
      color: 'green',
      suffix: `(${ownerPercentage.toFixed(1)}%)`
    },
    {
      label: 'Company Share',
      value: `Rs. ${parseFloat(summary.total_company_amount || 0).toLocaleString()}`,
      icon: Wallet,
      color: 'indigo',
      suffix: `(${companyPercentage.toFixed(1)}%)`
    },
    {
      label: 'Paid to Owner',
      value: `Rs. ${parseFloat(summary.paid_owner_amount || 0).toLocaleString()}`,
      icon: CheckCircle,
      color: 'emerald',
      suffix: ''
    },
    {
      label: 'Pending Payment',
      value: `Rs. ${parseFloat(summary.unpaid_owner_amount || 0).toLocaleString()}`,
      icon: Clock,
      color: 'yellow',
      suffix: ''
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      green: 'bg-green-100 text-green-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      emerald: 'bg-emerald-100 text-emerald-600',
      yellow: 'bg-yellow-100 text-yellow-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Owner Info Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{summary.owner_name}</h2>
            <p className="text-purple-100 mt-1">Owner ID: {summary.owner_id}</p>
          </div>
          <div className="bg-white/20 rounded-full px-4 py-2">
            <span className="text-sm font-medium">Active Owner</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.suffix && (
                  <p className="text-xs text-gray-400 mt-1">{stat.suffix}</p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${getColorClasses(stat.color)}`}>
                <stat.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Split Visualization */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Split</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Owner Share ({ownerPercentage.toFixed(1)}%)</span>
              <span className="font-semibold text-green-600">
                Rs. {totalOwnerAmount.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 rounded-full h-3 transition-all duration-500"
                style={{ width: `${ownerPercentage}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Company Share ({companyPercentage.toFixed(1)}%)</span>
              <span className="font-semibold text-blue-600">
                Rs. {parseFloat(summary.total_company_amount || 0).toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 rounded-full h-3 transition-all duration-500"
                style={{ width: `${companyPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status Card */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Paid Amount</p>
            <p className="text-3xl font-bold text-green-600">
              Rs. {parseFloat(summary.paid_owner_amount || 0).toLocaleString()}
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 rounded-full h-2 transition-all duration-500"
                style={{ 
                  width: totalOwnerAmount > 0 ? `${(summary.paid_owner_amount / totalOwnerAmount * 100)}%` : '0%'
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {totalOwnerAmount > 0 ? `${((summary.paid_owner_amount / totalOwnerAmount) * 100).toFixed(1)}% of total` : '0% of total'}
            </p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Pending Payment</p>
            <p className="text-3xl font-bold text-orange-600">
              Rs. {parseFloat(summary.unpaid_owner_amount || 0).toLocaleString()}
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-500 rounded-full h-2 transition-all duration-500"
                style={{ 
                  width: totalOwnerAmount > 0 ? `${(summary.unpaid_owner_amount / totalOwnerAmount * 100)}%` : '0%'
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {totalOwnerAmount > 0 ? `${((summary.unpaid_owner_amount / totalOwnerAmount) * 100).toFixed(1)}% of total` : '0% of total'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}