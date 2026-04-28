// frontend/src/components/bookings/BookingListView.jsx
import { useState } from 'react';
import { ChevronDown, CheckCircle, XCircle } from 'lucide-react';
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
  onPageChange,
  refreshData
}) {
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [showStatusMenu, setShowStatusMenu] = useState(null);

  // Helper function to format date without timezone offset
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    return new Date(year, month, day).toLocaleDateString();
  };

  // Ensure bookings is always an array
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const safeTotal = total || safeBookings.length;
  const safePage = page || 1;
  const safeLimit = limit || 10;

  // Define valid status transitions with their display properties
  const getValidTransitions = (currentStatus) => {
    switch(currentStatus?.toLowerCase()) {
      case 'pending':
        return [
          { value: 'confirmed', label: 'Confirm', color: 'success', icon: CheckCircle },
          { value: 'cancelled', label: 'Cancel', color: 'error', icon: XCircle }
        ];
      case 'confirmed':
        return [
          { value: 'cancelled', label: 'Cancel', color: 'error', icon: XCircle }
        ];
      case 'ongoing':
        return []; // No status changes from UI - handled by handover feature
      case 'completed':
        return []; // Terminal state - no changes
      case 'cancelled':
        return []; // Terminal state - no changes
      default:
        return [
          { value: 'confirmed', label: 'Confirm', color: 'success', icon: CheckCircle },
          { value: 'cancelled', label: 'Cancel', color: 'error', icon: XCircle }
        ];
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setUpdatingStatus(bookingId);
    
    try {
      let response;
      if (newStatus === 'cancelled') {
        response = await moduleApi.cancelBooking(bookingId);
        console.log('Cancel response:', response.data); // Debug log
      } else {
        response = await moduleApi.updateBookingStatus(bookingId, newStatus);
        console.log('Status update response:', response.data); // Debug log
      }
      
      // Check if response indicates success
      if (response.data.success) {
        toast.success(response.data.message || `Booking ${newStatus === 'cancelled' ? 'cancelled' : newStatus} successfully!`);
        
        // Reload after 1 second to show success message
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(response.data.message || 'Failed to update status');
        setUpdatingStatus(null);
      }
      
    } catch (error) {
      console.error('Status update error details:', error);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);
      
      // More specific error messages
      if (error.code === 'ERR_NETWORK') {
        toast.error('Network error: Cannot connect to server');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to perform this action');
      } else if (error.response?.status === 404) {
        toast.error('Booking not found');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update status');
      }
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
          <div className="text-xs text-slate-500">{row.phone_no || row.customer_phone || row.customer_email}</div>
        </div>
      )
    },
    { 
      key: 'vehicle_info', 
      label: 'Vehicle',
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.car_make} {row.car_model}</div>
          <div className="text-xs text-slate-500">{row.registration_no}</div>
        </div>
      )
    },
    { 
      key: 'date_range', 
      label: 'Duration',
      render: (row) => (
        <div className="text-sm">
          <div>{formatDisplayDate(row.date_from)}</div>
          <div className="text-xs text-slate-500">to {formatDisplayDate(row.date_to)}</div>
          <div className="text-xs font-medium text-blue-600">{row.total_days} days</div>
        </div>
      )
    },
    { 
      key: 'amounts', 
      label: 'Amounts',
      render: (row) => (
        <div className="text-sm">
          <div>Total: <span className="font-semibold">Rs. {(row.total_amount || 0).toLocaleString()}</span></div>
          <div className="text-xs text-slate-500">Advance: Rs. {(row.advance_amount || 0).toLocaleString()}</div>
          <div className="text-xs text-slate-500">Deposit: Rs. {(row.security_deposit || 0).toLocaleString()}</div>
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
      render: (row) => {
        const validTransitions = getValidTransitions(row.status);
        const isTerminal = row.status === 'completed' || row.status === 'cancelled';
        const isOngoing = row.status === 'ongoing';
        
        return (
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
                
                {/* Show action buttons for pending and confirmed statuses */}
                {!isTerminal && !isOngoing && validTransitions.length > 0 && (
                  <div className="flex gap-1">
                    {validTransitions.map((transition) => {
                      const IconComponent = transition.icon;
                      return (
                        <button
                          key={transition.value}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(row.id, transition.value);
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors
                            ${transition.color === 'success' 
                              ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                          title={transition.label}
                        >
                          <IconComponent size={12} />
                          <span>{transition.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                
                {/* Show info text for ongoing status */}
                {isOngoing && (
                  <span className="text-xs text-slate-400 ml-1" title="Status managed via handover">
                    (Handover)
                  </span>
                )}
              </div>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <DataTable
      title="Booking List"
      description="Manage all vehicle bookings, update status, and track payments"
      columns={columns}
      data={safeBookings}  // Always pass an array
      loading={loading}
      search={search}
      onSearch={onSearch}
      filters={filters}
      onFilterChange={onFilterChange}
      onEdit={onEdit}
      onDelete={onDelete}
      page={safePage}
      total={safeTotal}
      limit={safeLimit}
      onPageChange={onPageChange}
      actions={true} 
    />
  );
}