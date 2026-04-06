// frontend/src/components/Setup/SetupList.jsx
import React, { useEffect } from 'react';
import { useSetup } from '../../contexts/SetupContext';
import StatusBadge from '../Common/StatusBadge';
import LoadingSpinner from '../Common/LoadingSpinner';

const SetupList = ({ onEdit }) => {
  const { 
    items, 
    loading, 
    error, 
    pagination, 
    filters,
    config,
    fetchItems, 
    deleteItem, 
    setPage, 
    setFilters 
  } = useSetup();

  useEffect(() => {
    fetchItems();
  }, [fetchItems, pagination.page, filters]);

  const handleSearch = (e) => {
    setFilters({ search: e.target.value });
  };

  const handleStatusFilter = (e) => {
    setFilters({ status: e.target.value });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteItem(id);
    }
  };

  if (loading && items.length === 0) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="setup-list">
      <div className="filters mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search records..."
          value={filters.search || ''}
          onChange={handleSearch}
          className="px-3 py-2 border rounded-md flex-1"
        />
        <select
          value={filters.status || ''}
          onChange={handleStatusFilter}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              {config.columns.map(column => (
                <th key={column.key} className="px-4 py-2 text-left">
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={config.columns.length + 1} className="text-center py-8">
                  No data found. Try changing filters or add a new record.
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id} className="border-t">
                  {config.columns.map(column => (
                    <td key={column.key} className="px-4 py-2">
                      {column.type === 'status' ? (
                        <StatusBadge status={item[column.key]} />
                      ) : (
                        item[column.key]
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div>
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} records
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupList;