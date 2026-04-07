// frontend/src/components/bookings/BookingListView.jsx
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import DataTable from '../ui/DataTable';
import { moduleApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function BookingListView({ 
  bookings, 
  loading, 
  search, 
  onSearch,
  filters,
  filterValues,
  onFilterChange,
  onEdit,
  onDelete,
  page,
  total,
  limit,
  onPageChange 
}) {
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [showStatusMenu, setShowStatusMenu] = useState(null);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'confirmed', label: 'Confirmed', color: 'success' },
    { value: 'ongoing', label: 'Ongoing', color: 'info' },
    { value: 'completed', label: 'Completed', color: 'secondary' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' }
  ];

  const handleStatusUpdate = async (bookingId, newStatus) => {
    const statusString = String(newStatus);
    console.log("status: ", statusString);
    
    setUpdatingStatus(bookingId);
    setShowStatusMenu(null);
    
    try {
      if (statusString === 'cancelled') {
        await moduleApi.patch(`/bookings/${bookingId}/cancel`);
        toast.success('Booking cancelled successfully');
      } else {
        await moduleApi.patch(`/bookings/${bookingId}/status`, { status: statusString });
        toast.success(`Booking ${statusString} successfully`);
      }
      
      // Refresh the list
      if (onEdit) onEdit({ refresh: true });
      
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Get color classes for payment status
  const getPaymentStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid':
        return 'text-green-700 bg-green-50';
      case 'partial':
        return 'text-yellow-700 bg-yellow-50';
      case 'unpaid':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  // Get color classes for booking status
  const getBookingStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed':
        return 'text-green-700 bg-green-50';
      case 'ongoing':
        return 'text-blue-700 bg-blue-50';
      case 'pending':
        return 'text-yellow-700 bg-yellow-50';
      case 'completed':
        return 'text-purple-700 bg-purple-50';
      case 'cancelled':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const columns = [
    { key: 'booking_code', label: 'Booking Code' },
    { 
      key: 'customer_name', 
      label: 'Customer',
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.customer_name}</div>
          <div className="text-xs text-slate-500">{row.customer_phone || row.customer_email}</div>
        </div>
      )
    },
    { 
      key: 'vehicle_info', 
      label: 'Vehicle',
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.vehicle_make} {row.vehicle_model}</div>
          <div className="text-xs text-slate-500">{row.registration_no}</div>
        </div>
      )
    },
    { 
      key: 'date_range', 
      label: 'Duration',
      render: (row) => (
        <div className="text-sm">
          <div>{new Date(row.date_from).toLocaleDateString()}</div>
          <div className="text-xs text-slate-500">to {new Date(row.date_to).toLocaleDateString()}</div>
          <div className="text-xs font-medium text-blue-600">{row.total_days} days</div>
        </div>
      )
    },
    { 
      key: 'amounts', 
      label: 'Amounts',
      render: (row) => (
        <div className="text-sm">
          <div>Total: <span className="font-semibold">Rs. {row.total_amount?.toLocaleString()}</span></div>
          <div className="text-xs text-slate-500">Advance: Rs. {row.advance_amount?.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Deposit: Rs. {row.security_deposit?.toLocaleString()}</div>
        </div>
      )
    },
    { 
      key: 'payment_status', 
      label: 'Payment Status',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(row.payment_status)}`}>
          {row.payment_status ? row.payment_status.toUpperCase() : 'UNPAID'}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Booking Status',
      render: (row) => (
        <div className="relative">
          {updatingStatus === row.id ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-xs text-slate-500">Updating...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getBookingStatusColor(row.status)}`}>
                {row.status ? row.status.toUpperCase() : 'PENDING'}
              </span>
              
              {/* Only show dropdown for non-terminal states */}
              {row.status !== 'cancelled' && row.status !== 'completed' && (
                <div className="relative">
                  <button
                    onClick={() => setShowStatusMenu(showStatusMenu === row.id ? null : row.id)}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition"
                    title="Change Status"
                  >
                    <ChevronDown size={14} />
                  </button>
                  
                  {showStatusMenu === row.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setShowStatusMenu(null)}
                      />
                      <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 z-20 overflow-hidden">
                        {statusOptions.map((option) => {
                          // Don't show current status
                          if (option.value === row.status) return null;
                          
                          // Prevent invalid transitions
                          if (row.status === 'ongoing' && option.value === 'pending') return null;
                          if (row.status === 'confirmed' && option.value === 'pending') return null;
                          
                          return (
                            <button
                              key={option.value}
                              onClick={() => handleStatusUpdate(row.id, option.value)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
                            >
                              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                option.color === 'success' ? 'bg-green-500' :
                                option.color === 'warning' ? 'bg-yellow-500' :
                                option.color === 'info' ? 'bg-blue-500' :
                                option.color === 'error' ? 'bg-red-500' :
                                'bg-slate-500'
                              }`} />
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <DataTable
      title="Booking List"
      description="Manage all vehicle bookings, update status, and track payments"
      columns={columns}
      data={bookings}
      loading={loading}
      search={search}
      onSearch={onSearch}
      filters={filters}
      filterValues={filterValues}
      onFilterChange={onFilterChange}
      onEdit={onEdit}
      onDelete={onDelete}
      page={page}
      total={total}
      limit={limit}
      onPageChange={onPageChange}
      actions={true}
    />
  );
}