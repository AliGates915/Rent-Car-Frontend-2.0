// components/vehicles/VehicleListView.jsx
import { useState } from 'react';
import { Grid3x3, List, Search, Filter, X } from 'lucide-react';
import VehicleCard from './VehicleCard';
import DataTable from '../ui/DataTable';
import EmptyState from '../ui/EmptyState';

export default function VehicleListView({
  vehicles,
  loading,
  search,
  onSearch,
  filters = [],
  filterValues = {},
  onFilterChange,
  onEdit,
  onDelete,
  page,
  total,
  limit,
  onPageChange,
  onViewImages
}) {
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const columns = [
    { key: 'registration_no', label: 'Registration' },
    { key: 'car_make', label: 'Make' },
    { key: 'car_model', label: 'Model' },
    { key: 'year_of_model', label: 'Year' },
    { key: 'car_type', label: 'Type' },
    { key: 'rate_per_day', label: 'Rate / Day', type: 'currency' },
    { key: 'transmission_type', label: 'Transmission' },
    { key: 'fuel_type', label: 'Fuel Type' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status', type: 'status' },
  ];

  const activeFiltersCount = Object.values(filterValues).filter(v => v && v !== '').length;

  const handleFilterChange = (key, value) => {
    onFilterChange(key, value);
    if (onPageChange) onPageChange(1);
  };

  const clearAllFilters = () => {
    Object.keys(filterValues).forEach(key => {
      onFilterChange(key, '');
    });
    if (onPageChange) onPageChange(1);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              onSearch(e.target.value);
              if (onPageChange) onPageChange(1);
            }}
            placeholder="Search by registration, make, model, or location..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="flex gap-2">
          {/* Filter Toggle Button */}
          {filters.length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                showFilters || activeFiltersCount > 0
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter size={16} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 rounded-full bg-primary-600 px-1.5 py-0.5 text-xs text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          )}

          {/* View Toggle */}
          <div className="flex rounded-xl border border-slate-200 bg-white p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-2 transition ${
                viewMode === 'grid'
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Grid view"
            >
              <Grid3x3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg p-2 transition ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && filters.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Filters</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <X size={12} />
                Clear all
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  {filter.label}
                </label>
                <select
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary-500"
                >
                  {filter.options.map((option, idx) => (
                    <option key={`${filter.key}-${option.value}-${idx}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={`skeleton-${i}`} className="animate-pulse">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="h-48 bg-slate-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded"></div>
                    <div className="h-4 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !vehicles || vehicles.length === 0 ? (
        <EmptyState 
          title="No vehicles found"
          description="Try adjusting your search or filters to find what you're looking for."
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewImages={onViewImages}
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={vehicles}
          loading={loading}
          search={search}
          onSearch={onSearch}
          filters={[]}
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
      {!loading && vehicles && vehicles.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{vehicles.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{total}</span> vehicles
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm font-medium text-slate-700">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}