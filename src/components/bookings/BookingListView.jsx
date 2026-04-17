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
    const statusString = String(newStatus);
    
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
      
      // Refresh data first
      if (refreshData) {
        await refreshData();
      }
      
      // Then reset to page 1 (if needed)
      if (onPageChange) {
        onPageChange(1);
      }
      
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