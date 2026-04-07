// frontend/src/components/return/ReturnListView.jsx
import { Eye, Edit, Trash2, Calendar, Car, DollarSign, AlertTriangle } from 'lucide-react';
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
      key: 'return_date',
      label: 'Return Date',
      render: (row) => (
        <div className="text-sm">
          <div>{row.return_date ? new Date(row.return_date).toLocaleDateString() : 'N/A'}</div>
          <div className="text-xs text-slate-500">{row.return_date ? new Date(row.return_date).toLocaleTimeString() : ''}</div>
        </div>
      )
    },
    {
      key: 'return_details',
      label: 'Return Details',
      render: (row) => (
        <div className="text-sm space-y-1">
          <div>Odometer: {row.odometer_in?.toLocaleString()} km</div>
          <div>Fuel: {row.fuel_level_in}</div>
        </div>
      )
    },
    {
      key: 'charges',
      label: 'Charges',
      render: (row) => (
        <div className="text-sm">
          {row.extra_charges > 0 && <div className="text-orange-600">Extra: Rs. {row.extra_charges}</div>}
          {row.damage_charges > 0 && <div className="text-red-600">Damage: Rs. {row.damage_charges}</div>}
          {row.late_days > 0 && <div className="text-yellow-600">Late: {row.late_days} days</div>}
        </div>
      )
    },
    {
      key: 'amounts',
      label: 'Amounts',
      render: (row) => (
        <div className="text-sm">
          <div className="font-semibold">Final: Rs. {row.final_amount?.toLocaleString()}</div>
          <div className="text-green-600">Paid: Rs. {row.paid_amount?.toLocaleString()}</div>
          {row.balance_amount > 0 && (
            <div className="text-red-600">Balance: Rs. {row.balance_amount?.toLocaleString()}</div>
          )}
        </div>
      )
    },
    {
      key: 'returned_by',
      label: 'Returned By',
      render: (row) => (
        <div className="text-sm">{row.returned_by || 'N/A'}</div>
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
  );
}