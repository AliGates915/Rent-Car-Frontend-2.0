// frontend/src/components/handover/HandoverListView.jsx
import { useState } from 'react';
import { 
  Edit, Trash2, Gauge, Fuel, User, Car, Tag, 
  Phone, CreditCard, Calendar as CalendarIcon, 
  Clock, ChevronLeft, ChevronRight, X,  FileText, CheckCircle, Search
} from 'lucide-react';
import DataTable from '../ui/DataTable';

export default function HandoverListView({ 
  handovers, 
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const openImageViewer = (images, index) => {
    setSelectedImage(images);
    setCurrentImageIndex(index);
    setImageViewerOpen(true);
  };

  const nextImage = () => {
    if (selectedImage && currentImageIndex < selectedImage.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (selectedImage && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Define columns for DataTable fallback
  const columns = [
    { key: 'booking_code', label: 'Booking Code' },
    { 
      key: 'customer', 
      label: 'Customer',
      render: (row) => (
        <div>
          <div className="font-medium">{row.customer_name}</div>
          <div className="text-xs text-slate-500">{row.customer_phone}</div>
        </div>
      )
    },
    { 
      key: 'vehicle', 
      label: 'Vehicle',
      render: (row) => (
        <div>
          <div>{row.car_make} {row.car_model}</div>
          <div className="text-xs text-slate-500">{row.registration_no}</div>
        </div>
      )
    },
    { 
      key: 'handover_datetime', 
      label: 'Handover Date',
      render: (row) => formatDate(row.handover_datetime)
    },
    { 
      key: 'km_out', 
      label: 'Odometer',
      render: (row) => `${row.km_out?.toLocaleString()} km`
    },
    { 
      key: 'fuel_level_out', 
      label: 'Fuel'
    },
    { 
      key: 'booking_status', 
      label: 'Status',
      render: (row) => {
        const statusColors = {
          ongoing: 'bg-blue-100 text-blue-800',
          completed: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800',
          pending: 'bg-yellow-100 text-yellow-800',
          confirmed: 'bg-purple-100 text-purple-800'
        };
        const color = statusColors[row.booking_status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
        return (
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {row.booking_status || 'N/A'}
          </span>
        );
      }
    }
  ];

  // Custom Card View for better visual presentation
  const CustomCardView = ({ handover }) => {
    const [showFullDetails, setShowFullDetails] = useState(false);
    
    const statusConfig = {
      ongoing: { color: 'bg-blue-500', label: 'Ongoing', icon: '🔄' },
      completed: { color: 'bg-green-500', label: 'Completed', icon: '✅' },
      cancelled: { color: 'bg-red-500', label: 'Cancelled', icon: '❌' },
      pending: { color: 'bg-yellow-500', label: 'Pending', icon: '⏳' },
      confirmed: { color: 'bg-purple-500', label: 'Confirmed', icon: '✓' }
    };
    const config = statusConfig[handover.booking_status?.toLowerCase()] || statusConfig.ongoing;

    return (
      <div 
        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-100"
        onMouseEnter={() => setShowFullDetails(true)}
        onMouseLeave={() => setShowFullDetails(false)}
      >
        {/* Image Gallery */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
          {handover.images && handover.images.length > 0 ? (
            <div className="relative h-full">
              <img 
                src={handover.images[0].url} 
                alt={`${handover.car_make} ${handover.car_model}`}
                className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-500"
                onClick={() => openImageViewer(handover.images, 0)}
              />
              {handover.images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  +{handover.images.length} photos
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
              <Car className="w-16 h-16 text-slate-500" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className={`absolute top-3 left-3 ${config.color} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg`}>
            <span>{config.icon}</span>
            <span>{config.label}</span>
          </div>
          
          {/* Quick Actions */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={() => onEdit(handover)}
              className="p-2 bg-white/90 hover:bg-white rounded-lg transition shadow-lg"
              title="Edit Handover"
            >
              <Edit size={16} className="text-slate-600" />
            </button>
            <button
              onClick={() => onDelete(handover)}
              className="p-2 bg-white/90 hover:bg-white rounded-lg transition shadow-lg"
              title="Delete Handover"
            >
              <Trash2 size={16} className="text-red-600" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {handover.car_make} {handover.car_model}
              </h3>
              <p className="text-xs text-slate-500 font-mono">{handover.registration_no}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Booking ID</p>
              <p className="text-sm font-mono font-semibold text-slate-700">{handover.booking_code}</p>
            </div>
          </div>
          
          {/* Customer Info */}
          <div className="mb-3 p-2 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <User size={14} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-700">{handover.customer_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={12} className="text-slate-400" />
              <span className="text-xs text-slate-500">{handover.customer_phone}</span>
            </div>
          </div>
          
          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon size={14} className="text-blue-500" />
              <div>
                <p className="text-xs text-slate-500">Handover</p>
                <p className="text-xs font-medium">{formatDate(handover.handover_datetime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-green-500" />
              <div>
                <p className="text-xs text-slate-500">Duration</p>
                <p className="text-xs font-medium">{handover.total_days} days</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Gauge size={14} className="text-purple-500" />
              <div>
                <p className="text-xs text-slate-500">Odometer</p>
                <p className="text-xs font-medium">{handover.km_out?.toLocaleString()} km</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Fuel size={14} className="text-orange-500" />
              <div>
                <p className="text-xs text-slate-500">Fuel</p>
                <p className="text-xs font-medium">{handover.fuel_level_out}</p>
              </div>
            </div>
          </div>
          
          {/* Amount Section */}
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total Amount</span>
              <span className="text-lg font-bold text-slate-900">{formatCurrency(handover.total_amount)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
              <span>Advance Paid</span>
              <span className="text-green-600">{formatCurrency(handover.advance_amount)}</span>
            </div>
            {handover.vehicle_out_notes && (
              <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                📝 {handover.vehicle_out_notes}
              </div>
            )}
          </div>
          
          {/* Expandable Details */}
          {showFullDetails && (
            <div className="mt-3 pt-3 border-t animate-slideUp">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Car Type:</span>
                  <span className="ml-2 font-medium">{handover.car_type}</span>
                </div>
                <div>
                  <span className="text-slate-500">Transmission:</span>
                  <span className="ml-2 font-medium">{handover.transmission_type}</span>
                </div>
                <div>
                  <span className="text-slate-500">Fuel Type:</span>
                  <span className="ml-2 font-medium">{handover.fuel_type}</span>
                </div>
                <div>
                  <span className="text-slate-500">Rate/Day:</span>
                  <span className="ml-2 font-medium">{formatCurrency(handover.rate_per_day)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Image Viewer Modal
  const ImageViewerModal = () => {
    if (!imageViewerOpen || !selectedImage) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setImageViewerOpen(false)}>
        <div className="relative max-w-5xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
          {/* Close Button */}
          <button
            onClick={() => setImageViewerOpen(false)}
            className="absolute -top-12 right-0 p-2 text-white hover:text-slate-300 transition"
          >
            <X size={24} />
          </button>
          
          {/* Image */}
          <div className="relative">
            <img 
              src={selectedImage[currentImageIndex]?.url} 
              alt={`Car ${currentImageIndex + 1}`}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            
            {/* Navigation */}
            {selectedImage.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition"
                >
                  <ChevronLeft size={24} className="text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition"
                >
                  <ChevronRight size={24} className="text-white" />
                </button>
              </>
            )}
            
            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {selectedImage.length}
            </div>
          </div>
          
          {/* Thumbnails */}
          {selectedImage.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {selectedImage.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                    idx === currentImageIndex ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // If we have data, show card view
  if (handovers && handovers.length > 0) {
    const totalPages = Math.ceil(total / limit);
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vehicle Handovers</h1>
            <p className="text-slate-500 mt-1">Track and manage all vehicle handover records</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search handovers..."
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">Total Handovers</p>
                <p className="text-2xl font-bold mt-1">{total}</p>
              </div>
              <Car size={24} className="opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">Active Handovers</p>
                <p className="text-2xl font-bold mt-1">
                  {handovers.filter(h => h.booking_status === 'ongoing').length}
                </p>
              </div>
              <CheckCircle size={24} className="opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(handovers.reduce((sum, h) => sum + (h.total_amount || 0), 0))}
                </p>
              </div>
              <CreditCard size={24} className="opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">Completed</p>
                <p className="text-2xl font-bold mt-1">
                  {handovers.filter(h => h.booking_status === 'completed').length}
                </p>
              </div>
              <FileText size={24} className="opacity-80" />
            </div>
          </div>
        </div>
        
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {handovers.map((handover) => (
            <CustomCardView key={handover.id} handover={handover} />
          ))}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-slate-50 transition"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-slate-50 transition"
            >
              Next
            </button>
          </div>
        )}
        
        {/* Image Viewer Modal */}
        <ImageViewerModal />
      </div>
    );
  }

  // Fallback to table view if no data or loading
  return (
    <DataTable
      title="Vehicle Handovers"
      description="Track all vehicle handovers, accessories, and customer details"
      columns={columns}
      data={handovers || []}
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