import React, { useState, useEffect } from 'react';
import { 
  CarFront, 
  ClipboardList, 
  CreditCard, 
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import RevenueChart from '../components/RevenueChart';
import TimelineSection from '../components/TimelineSection';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    summaryCards: [],
    quickStats: [],
    recentBookings: [],
    recentPayments: [],
    upcomingBookings: [],
    revenueData: [],
    vehicleUtilization: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getStats();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        toast.error(response.message || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const renderChangeIndicator = (change) => {
    if (!change) return null;
    const isPositive = change.startsWith('+');
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
        isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
      }`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {change}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Summary Cards */}
      <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        {dashboardData.summaryCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">{card.label}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <h3 className="text-3xl font-bold text-slate-900">
                {card.isCurrency ? formatCurrency(card.value) : card.value.toLocaleString()}
              </h3>
              {renderChangeIndicator(card.change)}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardData.quickStats.map((item) => {
          const IconMap = {
            Users: Users,
            CarFront: CarFront,
            ClipboardList: ClipboardList,
            CreditCard: CreditCard
          };
          const Icon = IconMap[item.icon] || CreditCard;
          return (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <h4 className="mt-2 text-2xl font-bold text-slate-900">
                    {item.isCurrency ? formatCurrency(item.value) : item.value.toLocaleString()}
                  </h4>
                  {item.trend && (
                    <p className={`text-xs mt-1 ${item.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {item.trend} from last month
                    </p>
                  )}
                </div>
                <div className="rounded-2xl bg-primary-50 p-3 text-primary-600">
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={dashboardData.revenueData} />

      {/* Recent Bookings and Payments */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {dashboardData.recentBookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{booking.code}</p>
                  <p className="text-sm text-slate-500">{booking.customer} - {booking.vehicle}</p>
                  <p className="text-xs text-slate-400">
                    <Calendar size={12} className="inline mr-1" />
                    {booking.dateFrom} to {booking.dateTo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{formatCurrency(booking.amount)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Payments</h3>
          <div className="space-y-3">
            {dashboardData.recentPayments.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{payment.bookingCode}</p>
                  <p className="text-sm text-slate-500">{payment.customer}</p>
                  <p className="text-xs text-slate-400 capitalize">{payment.type} - {payment.method}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
                  <p className="text-xs text-slate-400">
                    <Clock size={12} className="inline mr-1" />
                    {new Date(payment.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Bookings & Vehicle Utilization */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Bookings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Bookings (Next 7 Days)</h3>
          <div className="space-y-3">
            {dashboardData.upcomingBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{booking.code}</p>
                  <p className="text-sm text-slate-600">{booking.customer}</p>
                  <p className="text-xs text-slate-500">{booking.vehicle}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">
                    <Calendar size={12} className="inline mr-1" />
                    {booking.dateFrom}
                  </p>
                  <p className="font-semibold text-slate-900">{formatCurrency(booking.amount)}</p>
                </div>
              </div>
            ))}
            {dashboardData.upcomingBookings.length === 0 && (
              <p className="text-center text-gray-500 py-8">No upcoming bookings</p>
            )}
          </div>
        </div>

        {/* Vehicle Utilization */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Performing Vehicles</h3>
          <div className="space-y-4">
            {dashboardData.vehicleUtilization.map((vehicle) => (
              <div key={vehicle.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{vehicle.name}</span>
                  <span className="text-slate-500">{vehicle.utilizationRate.toFixed(0)}% utilized</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                    style={{ width: `${vehicle.utilizationRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{vehicle.totalBookings} total bookings</span>
                  <span>{vehicle.activeBookings} active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}