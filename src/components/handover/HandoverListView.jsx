// frontend/src/components/handover/HandoverListView.jsx
import { Eye, Edit, Trash2, Calendar, Car, Fuel, Gauge } from 'lucide-react';
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
  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'booking_info',
      label: 'Booking',
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900">#{row.booking_id}</div>
          <div className="text-xs text-slate-500">{row.booking_code || 'N/A'}</div>
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
      key: 'handover_details',
      label: 'Handover Details',
      render: (row) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-1">
            <Gauge size={14} className="text-slate-400" />
            <span>{row.km_out?.toLocaleString()} km</span>
          </div>
          <div className="flex items-center gap-1">
            <Fuel size={14} className="text-slate-400" />
            <span>{row.fuel_level_out}</span>
          </div>
        </div>
      )
    },
    {
      key: 'handover_datetime',
      label: 'Handover Date',
      render: (row) => (
        <div className="text-sm">
          <div>{row.handover_datetime ? new Date(row.handover_datetime).toLocaleDateString() : 'N/A'}</div>
          <div className="text-xs text-slate-500">{row.handover_datetime ? new Date(row.handover_datetime).toLocaleTimeString() : ''}</div>
        </div>
      )
    },
    {
      key: 'handed_over_by',
      label: 'Handed By',
      render: (row) => (
        <div className="text-sm">
          <div className="font-medium">{row.handed_over_by || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'booking_status',
      label: 'Status',
      render: (row) => (
        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
          row.booking_status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
          row.booking_status === 'completed' ? 'bg-green-100 text-green-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.booking_status || 'ongoing'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(row)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <DataTable
      title="Vehicle Handovers"
      description="Manage vehicle handover records and track accessories"
      columns={columns}
      data={handovers}
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