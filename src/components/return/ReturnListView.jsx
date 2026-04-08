// frontend/src/components/return/ReturnListView.jsx
import { useState } from 'react';
import { 
  Eye, Edit, Trash2, Calendar, Car, DollarSign, AlertTriangle, 
  TrendingUp, TrendingDown, Wallet, CreditCard, Clock, Fuel,
  Gauge, MapPin, User, Phone, FileText, CheckCircle, XCircle,
  Search, Filter, Download, Printer, ChevronLeft, ChevronRight
} from 'lucide-react';
import DataTable from '../ui/DataTable';

export default function ReturnListView({ 
  returns, 
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
  summary // Add summary prop
}) {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getStatusBadge = (balance) => {
    if (balance > 0) {
      return { color: 'bg-red-100 text-red-800', label: 'Pending Balance', icon: AlertTriangle };
    } else if (balance < 0) {
      return { color: 'bg-green-100 text-green-800', label: 'Overpaid', icon: CheckCircle };
    } else {
      return { color: 'bg-blue-100 text-blue-800', label: 'Settled', icon: CheckCircle };
    }
  };

  // Summary Cards Component
  const SummaryCards = ({ summaryData }) => {
    const cards = [
      {
        title: 'Total Returns',
        value: summaryData?.total_returns || 0,
        icon: Car,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        prefix: '',
        suffix: 'returns'
      },
      {
        title: 'Total Revenue',
        value: formatCurrency(summaryData?.total_revenue || 0),
        icon: DollarSign,
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50',
        textColor: 'text-green-600',
        prefix: '',
        suffix: ''
      },
      {
        title: 'Total Paid',
        value: formatCurrency(summaryData?.total_paid || 0),
        icon: CreditCard,
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600',
        prefix: '',
        suffix: ''
      },
      {
        title: 'Pending Balance',
        value: formatCurrency(summaryData?.total_balance || 0),
        icon: Wallet,
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-600',
        prefix: '',
        suffix: ''
      },
      {
        title: 'Extra Charges',
        value: formatCurrency(summaryData?.total_extra_charges || 0),
        icon: TrendingUp,
        color: 'from-yellow-500 to-yellow-600',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-600',
        prefix: '+',
        suffix: ''
      },
      {
        title: 'Damage Charges',
        value: formatCurrency(summaryData?.total_damage_charges || 0),
        icon: AlertTriangle,
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        prefix: '⚠️ ',
        suffix: ''
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-100`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${card.bgColor}`}>
                  <card.icon className={`w-5 h-5 ${card.textColor}`} />
                </div>
                <span className="text-2xl font-bold text-slate-800">{card.value}</span>
              </div>
              <p className="text-sm text-slate-500 font-medium">{card.title}</p>
              {card.suffix && (
                <p className="text-xs text-slate-400 mt-1">{card.suffix}</p>
              )}
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />
          </div>
        ))}
      </div>
    );
  };

  // Card View Component
  const ReturnCard = ({ returnRecord }) => {
    const status = getStatusBadge(returnRecord.balance_amount);
    const StatusIcon = status.icon;

    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400">Return ID</p>
              <p className="text-sm font-mono font-semibold text-white">#{returnRecord.id}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(returnRecord)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition"
                title="Edit Return"
              >
                <Edit size={14} className="text-white" />
              </button>
              <button
                onClick={() => onDelete(returnRecord)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition"
                title="Delete Return"
              >
                <Trash2 size={14} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Booking & Customer */}
          <div className="mb-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-slate-900">{returnRecord.car_make} {returnRecord.car_model}</h3>
                <p className="text-xs text-slate-500 font-mono">{returnRecord.registration_no}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Booking</p>
                <p className="text-sm font-mono font-semibold text-slate-700">{returnRecord.booking_code}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User size={14} />
              <span>{returnRecord.customer_name}</span>
              <span className="text-slate-400">•</span>
              <Phone size={12} />
              <span className="text-xs">{returnRecord.customer_phone}</span>
            </div>
          </div>

          {/* Return Details */}
          <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-xs text-slate-500 mb-1">Return Date</p>
              <div className="flex items-center gap-1">
                <Calendar size={12} className="text-blue-500" />
                <span className="text-sm font-medium">{formatDate(returnRecord.return_date)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Duration</p>
              <p className="text-sm font-medium">{returnRecord.total_days} days</p>
              {returnRecord.late_days > 0 && (
                <p className="text-xs text-red-600">Late: {returnRecord.late_days} days</p>
              )}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="space-y-2 mb-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Final Amount</span>
              <span className="text-lg font-bold text-slate-900">{formatCurrency(returnRecord.final_amount)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Paid Amount</span>
              <span className="text-green-600 font-medium">{formatCurrency(returnRecord.paid_amount)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Balance</span>
              <span className={`font-medium ${returnRecord.balance_amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(Math.abs(returnRecord.balance_amount))}
                {returnRecord.balance_amount > 0 ? ' Due' : ' Refund'}
              </span>
            </div>
          </div>

          {/* Extra Charges */}
          {(returnRecord.extra_charges > 0 || returnRecord.damage_charges > 0) && (
            <div className="border-t pt-3 mb-3">
              <p className="text-xs font-semibold text-slate-700 mb-2">Additional Charges</p>
              <div className="space-y-1">
                {returnRecord.extra_charges > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Extra Charges</span>
                    <span className="text-orange-600">+{formatCurrency(returnRecord.extra_charges)}</span>
                  </div>
                )}
                {returnRecord.damage_charges > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Damage Charges</span>
                    <span className="text-red-600">+{formatCurrency(returnRecord.damage_charges)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
            <StatusIcon size={12} />
            <span>{status.label}</span>
          </div>

          {/* Notes */}
          {returnRecord.notes && (
            <div className="mt-3 p-2 bg-yellow-50 rounded-lg text-xs text-yellow-800">
              📝 {returnRecord.notes}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Table Columns
  const columns = [
    { key: 'id', label: 'ID', width: '70px' },
    {
      key: 'booking_info',
      label: 'Booking',
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.booking_code || `#${row.booking_id}`}</div>
          <div className="text-xs text-slate-500">{row.customer_name}</div>
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
      key: 'return_date',
      label: 'Return Date',
      render: (row) => (
        <div className="text-sm">
          <div>{new Date(row.return_date).toLocaleDateString()}</div>
          <div className="text-xs text-slate-500">{row.total_days} days</div>
          {row.late_days > 0 && <div className="text-xs text-red-600">Late: {row.late_days}d</div>}
        </div>
      )
    },
    {
      key: 'amounts',
      label: 'Amounts',
      render: (row) => (
        <div className="text-sm">
          <div className="font-semibold">{formatCurrency(row.final_amount)}</div>
          <div className="text-green-600">Paid: {formatCurrency(row.paid_amount)}</div>
          {row.balance_amount > 0 && (
            <div className="text-red-600">Due: {formatCurrency(row.balance_amount)}</div>
          )}
        </div>
      )
    },
    {
      key: 'charges',
      label: 'Charges',
      render: (row) => (
        <div className="space-y-1 text-sm">
        <div className="text-orange-600">
          Extra: {Number(row.extra_charges) > 0 ? formatCurrency(row.extra_charges) : "0"}
        </div>
      
        <div className="text-red-600">
          Damage: {Number(row.damage_charges) > 0 ? formatCurrency(row.damage_charges) : "0"}
        </div>
      </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const status = getStatusBadge(row.balance_amount);
        const StatusIcon = status.icon;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
            <StatusIcon size={12} />
            {status.label}
          </span>
        );
      }
    },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vehicle Returns</h1>
          <p className="text-slate-500 mt-1">Manage vehicle return records and track final settlements</p>
        </div>
        <div className="flex gap-3">
          {/* View Toggle */}
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm transition ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 text-sm transition ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              Card View
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search returns..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards summaryData={summary} />

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === 'cards' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {returns?.map((returnRecord) => (
              <ReturnCard key={returnRecord.id} returnRecord={returnRecord} />
            ))}
          </div>
          {returns?.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700">No Returns Found</h3>
              <p className="text-slate-500 mt-1">No vehicle return records match your criteria</p>
            </div>
          )}
        </>
      ) : (
        <DataTable
          title="Vehicle Returns"
          description="Manage vehicle return records and track final settlements"
          columns={columns}
          data={returns}
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-slate-50 transition flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <span className="px-4 py-2 text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-slate-50 transition flex items-center gap-2"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}