// components/owner-earnings/OwnerSummary.jsx
import { useState } from 'react';
import useFetch from '../../../hooks/useFetch';
import { DollarSign, Car, Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export default function OwnerSummary({ ownerId }) {
  const { data: summary, loading } = useFetch(
    ownerId ? `/owner-earnings/summary/${ownerId}` : null
  );
console.log("Data ", ownerId);

  if (!ownerId) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <p className="text-gray-500">Select an owner to view summary</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const stats = [
    {
      label: 'Total Vehicles',
      value: summary.total_vehicles || 0,
      icon: Car,
      color: 'blue'
    },
    {
      label: 'Completed Bookings',
      value: summary.completed_paid_bookings || 0,
      icon: Calendar,
      color: 'purple'
    },
    {
      label: 'Total Booking Amount',
      value: `Rs.${parseFloat(summary.total_booking_amount || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'orange'
    },
    {
      label: 'Total Owner Amount',
      value: `Rs.${parseFloat(summary.total_owner_amount || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'green'
    },
    {
      label: 'Paid Amount',
      value: `Rs.${parseFloat(summary.paid_owner_amount || 0).toLocaleString()}`,
      icon: CheckCircle,
      color: 'emerald'
    },
    {
      label: 'Unpaid Amount',
      value: `Rs.${parseFloat(summary.unpaid_owner_amount || 0).toLocaleString()}`,
      icon: Clock,
      color: 'yellow'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      green: 'bg-green-100 text-green-600',
      emerald: 'bg-emerald-100 text-emerald-600',
      yellow: 'bg-yellow-100 text-yellow-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Owner Info Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold">{summary.owner_name}</h2>
        <p className="text-primary-100 mt-1">Financial Summary</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${getColorClasses(stat.color)}`}>
                <stat.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Company vs Owner Split */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Split</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Owner Share ({summary.owner_percentage || 80}%)</span>
              <span className="font-semibold text-green-600">
                Rs.{parseFloat(summary.total_owner_amount || 0).toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 rounded-full h-2 transition-all"
                style={{ width: `${summary.owner_percentage || 80}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Company Share ({100 - (summary.owner_percentage || 80)}%)</span>
              <span className="font-semibold text-blue-600">
                Rs.{parseFloat(summary.total_company_amount || 0).toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 rounded-full h-2 transition-all"
                style={{ width: `${100 - (summary.owner_percentage || 80)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}