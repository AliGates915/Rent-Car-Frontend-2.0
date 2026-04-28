import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Search, Plus, Calendar, Download, RefreshCw, CheckCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import maintenanceService from '../../services/maintenance.service';
import vehicleApi from '../../services/api';
import MaintenanceForm from './MaintenanceForm';

export default function MaintenanceList() {
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [vehicles, setVehicles] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [filters, setFilters] = useState({
    vehicle_id: '',
    status: '',
    from_date: '',
    to_date: ''
  });
  const [summary, setSummary] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch vehicles for mapping
  const fetchVehicles = async () => {
    try {
      const data = await vehicleApi.getAll();
      const vehicleMap = {};
      data.forEach(v => {
        vehicleMap[v.id] = `${v.registration_no} - ${v.car_make} ${v.car_model}`;
      });
      setVehicles(vehicleMap);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  // Fetch maintenance logs
  const fetchMaintenanceLogs = async () => {
    setLoading(true);
    try {
      const data = await maintenanceService.getAll(filters);
      setMaintenanceLogs(data);
      
      // Fetch summary
      const summaryData = await maintenanceService.getSummary(selectedYear);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching maintenance logs:', error);
      toast.error('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    fetchMaintenanceLogs();
  }, [filters, selectedYear]);

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await maintenanceService.delete(id);
      toast.success('Maintenance record deleted successfully');
      fetchMaintenanceLogs();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting maintenance:', error);
      toast.error('Failed to delete maintenance record');
    }
  };

  // Handle complete maintenance
  const handleComplete = async (vehicleId, maintenanceId) => {
    try {
      await maintenanceService.complete(vehicleId, maintenanceId);
      toast.success('Maintenance marked as completed');
      fetchMaintenanceLogs();
    } catch (error) {
      console.error('Error completing maintenance:', error);
      toast.error('Failed to complete maintenance');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Filter logs based on search
  const filteredLogs = maintenanceLogs.filter(log =>
    (vehicles[log.vehicle_id] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.vendor_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.amount?.toString().includes(searchTerm)
  );

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      overdue: { color: 'bg-red-100 text-red-800', label: 'Overdue' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Vehicle', 'Maintenance Type', 'Odometer (KM)', 'Amount', 'Vendor', 'Status', 'Notes'];
    const csvData = filteredLogs.map(log => [
      log.id,
      formatDate(log.service_date),
      vehicles[log.vehicle_id] || 'N/A',
      log.maintenance_type || 'N/A',
      log.odometer_km || 0,
      log.amount,
      log.vendor_name || '',
      log.status || 'pending',
      log.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `maintenance_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  // Calculate total amount
  const totalAmount = filteredLogs.reduce((sum, log) => sum + (parseFloat(log.amount) || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <p className="text-sm opacity-90">Total Maintenance</p>
            <p className="text-2xl font-bold">{summary.summary.total_maintenance}</p>
            <p className="text-xs opacity-75">Service records</p>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
            <p className="text-sm opacity-90">Total Cost</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.summary.total_cost)}</p>
            <p className="text-xs opacity-75">Year to date</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <p className="text-sm opacity-90">Avg. Cost</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.summary.average_cost)}</p>
            <p className="text-xs opacity-75">Per maintenance</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <p className="text-sm opacity-90">Vehicles Serviced</p>
            <p className="text-2xl font-bold">{summary.summary.vehicles_serviced}</p>
            <p className="text-xs opacity-75">Unique vehicles</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Vehicle Maintenance Records</h2>
          <p className="text-sm text-gray-500">Track and manage all vehicle service and repairs</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() => {
              setSelectedMaintenance(null);
              setShowForm(true);
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            New Maintenance
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="relative md:col-span-2">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by vehicle, vendor, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filters.vehicle_id}
          onChange={(e) => setFilters(prev => ({ ...prev, vehicle_id: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Vehicles</option>
          {Object.entries(vehicles).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>

        <div className="flex gap-2">
          <input
            type="date"
            value={filters.from_date}
            onChange={(e) => setFilters(prev => ({ ...prev, from_date: e.target.value }))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="From"
          />
          <input
            type="date"
            value={filters.to_date}
            onChange={(e) => setFilters(prev => ({ ...prev, to_date: e.target.value }))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="To"
          />
        </div>
      </div>

      {/* Total */}
      <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Showing {filteredLogs.length} maintenance records</span>
        <span className="text-sm font-semibold text-red-600">Total Cost: {formatCurrency(totalAmount)}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vehicle</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Odometer</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vendor</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                  No maintenance records found
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">#{log.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(log.service_date)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{vehicles[log.vehicle_id] || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.maintenance_type || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.odometer_km?.toLocaleString()} km</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                    {formatCurrency(log.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.vendor_name || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(log.status)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {log.status !== 'completed' && (
                        <button
                          onClick={() => handleComplete(log.vehicle_id, log.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Mark as Complete"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedMaintenance(log);
                          setShowForm(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(log.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this maintenance record? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <MaintenanceForm
          maintenance={selectedMaintenance}
          onClose={() => {
            setShowForm(false);
            setSelectedMaintenance(null);
          }}
          onSuccess={() => {
            fetchMaintenanceLogs();
            setShowForm(false);
            setSelectedMaintenance(null);
          }}
        />
      )}
    </div>
  );
}