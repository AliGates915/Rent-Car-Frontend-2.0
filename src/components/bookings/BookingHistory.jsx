// frontend/src/components/bookings/BookingHistory.jsx
import { useState, useEffect } from 'react';
import { Download, Filter, Calendar, Car, User, TrendingUp } from 'lucide-react';
import { moduleApi } from '../../services/api';
import DataTable from '../ui/DataTable';
import toast from 'react-hot-toast';

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    payment_status: '',
    date_from: '',
    date_to: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetchBookings();
    fetchStatistics();
  }, [filters, pagination.page]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Build query params
      const queryParams = new URLSearchParams();
      queryParams.append('page', pagination.page);
      queryParams.append('limit', pagination.limit);
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.payment_status) queryParams.append('payment_status', filters.payment_status);
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);
      if (filters.search) queryParams.append('search', filters.search);
      
      const url = `/bookings/history/list?${queryParams.toString()}`;
      const response = await moduleApi.getAll('/bookings/history/list', {
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status,
        payment_status: filters.payment_status,
        date_from: filters.date_from,
        date_to: filters.date_to,
        search: filters.search
      });
      
    //   console.log("Bookings response:", response.data);

      
      if (response.data && response.data.data) {
        setBookings(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || 0,
          totalPages: response.data.pagination?.totalPages || 0
        }));
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Failed to fetch booking history:', error);
      toast.error('Failed to fetch booking history');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await moduleApi.getAll('/bookings/statistics/summary');
    //   console.log('Statistics response:', response.data);
      
      if (response.data) {
        setStatistics({
          total_bookings: response.data.total_bookings || 0,
          completed_bookings: response.data.completed_bookings || 0,
          cancelled_bookings: response.data.cancelled_bookings || 0,
          ongoing_bookings: response.data.ongoing_bookings || 0,
          confirmed_bookings: response.data.confirmed_bookings || 0,
          pending_bookings: response.data.pending_bookings || 0,
          paid_bookings: response.data.paid_bookings || 0,
          partial_bookings: response.data.partial_bookings || 0,
          unpaid_bookings: response.data.unpaid_bookings || 0,
          total_revenue: response.data.total_revenue || 0,
          total_collected: response.data.total_collected || 0,
          total_advance: response.data.total_advance || 0,
          total_deposit: response.data.total_deposit || 0,
          average_booking_value: response.data.average_booking_value || 0
        });
      } else {
        setDefaultStatistics();
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      setDefaultStatistics();
    }
  };

  const setDefaultStatistics = () => {
    setStatistics({
      total_bookings: 0,
      completed_bookings: 0,
      cancelled_bookings: 0,
      ongoing_bookings: 0,
      confirmed_bookings: 0,
      pending_bookings: 0,
      paid_bookings: 0,
      partial_bookings: 0,
      unpaid_bookings: 0,
      total_revenue: 0,
      total_collected: 0,
      total_advance: 0,
      total_deposit: 0,
      average_booking_value: 0
    });
  };

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.payment_status) queryParams.append('payment_status', filters.payment_status);
      if (filters.date_from) queryParams.append('start_date', filters.date_from);
      if (filters.date_to) queryParams.append('end_date', filters.date_to);
      
      const url = `/bookings/export/history?${queryParams.toString()}`;
      const response = await moduleApi.getAll(url, {}, { responseType: 'blob' });
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `booking_history_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const columns = [
    { key: 'booking_code', label: 'Booking Code' },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.customer_name || 'N/A'}</div>
          <div className="text-xs text-slate-500">{row.customer_phone || ''}</div>
        </div>
      )
    },
    {
      key: 'vehicle',
      label: 'Vehicle',
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.car_make} {row.car_model}</div>
          <div className="text-xs text-slate-500">{row.registration_no}</div>
        </div>
      )
    },
    {
      key: 'period',
      label: 'Period',
      render: (row) => (
        <div className="text-sm">
          <div>{row.date_from ? new Date(row.date_from).toLocaleDateString() : 'N/A'}</div>
          <div className="text-xs text-slate-500">to {row.date_to ? new Date(row.date_to).toLocaleDateString() : 'N/A'}</div>
          <div className="text-xs font-medium text-blue-600">{row.total_days} days</div>
        </div>
      )
    },
    {
      key: 'amounts',
      label: 'Amounts',
      render: (row) => (
        <div className="text-sm">
          <div className="font-semibold">Rs. {(row.total_amount || 0).toLocaleString()}</div>
          <div className="text-xs text-green-600">Paid: Rs. {(row.paid_amount || 0).toLocaleString()}</div>
          <div className="text-xs text-orange-600">Remaining: Rs. {((row.total_amount || 0)- (row.paid_amount || 0)).toLocaleString()}</div>
        </div>
      )
    },
    {
      key: 'payment_status',
      label: 'Payment',
      render: (row) => {
        const statusColors = {
          paid: 'bg-green-100 text-green-800',
          partial: 'bg-yellow-100 text-yellow-800',
          unpaid: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${statusColors[row.payment_status] || 'bg-gray-100 text-gray-800'}`}>
            {row.payment_status || 'unpaid'}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const statusColors = {
          confirmed: 'bg-green-100 text-green-800',
          ongoing: 'bg-blue-100 text-blue-800',
          pending: 'bg-yellow-100 text-yellow-800',
          completed: 'bg-gray-100 text-gray-800',
          cancelled: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${statusColors[row.status] || 'bg-gray-100 text-gray-800'}`}>
            {row.status || 'pending'}
          </span>
        );
      }
    },
    {
      key: 'created_at',
      label: 'Booked On',
      render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Bookings</p>
                <p className="text-2xl font-bold text-slate-900">{statistics.total_bookings}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar size={24} className="text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Completed: {statistics.completed_bookings} | Cancelled: {statistics.cancelled_bookings}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  Rs. {(statistics.total_revenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp size={24} className="text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Collected: Rs. {(statistics.total_collected || 0).toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Average Booking</p>
                <p className="text-2xl font-bold text-slate-900">
                  Rs. {(statistics.average_booking_value || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Car size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Active Bookings</p>
                <p className="text-2xl font-bold text-slate-900">{statistics.ongoing_bookings}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <User size={24} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Filter size={18} />
            Filters
          </h3>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download size={16} />
            Export
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search by booking, customer, vehicle..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.payment_status}
            onChange={(e) => setFilters({ ...filters, payment_status: e.target.value, page: 1 })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All Payment Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>

          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => setFilters({ ...filters, date_from: e.target.value, page: 1 })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="From Date"
          />

          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => setFilters({ ...filters, date_to: e.target.value, page: 1 })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="To Date"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <DataTable
        title="Booking History"
        description="Complete history of all bookings with filters and export options"
        columns={columns}
        data={bookings}
        loading={loading}
        page={pagination.page}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        actions={false}
      />
    </div>
  );
}