import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Calendar, DollarSign, Car, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import maintenanceService from '../../services/maintenance.service';
import vehicleApi from '../../services/api';

const MAINTENANCE_TYPES = [
  { id: 1, name: 'Oil Change' },
  { id: 2, name: 'Tire Rotation' },
  { id: 3, name: 'Brake Service' },
  { id: 4, name: 'Engine Tune-up' },
  { id: 5, name: 'Transmission Service' },
  { id: 6, name: 'Battery Replacement' },
  { id: 7, name: 'AC Service' },
  { id: 8, name: 'General Inspection' },
  { id: 9, name: 'Body Repair' },
  { id: 10, name: 'Paint Work' }
];

export default function MaintenanceForm({ maintenance, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    maintenance_type_id: '',
    service_date: new Date().toISOString().split('T')[0],
    odometer_km: '',
    amount: '',
    vendor_name: '',
    notes: '',
    status: 'pending'
  });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingVehicles, setFetchingVehicles] = useState(true);

  // useEffect(() => {
  //   // Fetch vehicles
  //   const fetchVehicles = async () => {
  //     try {
  //       const data = await vehicleApi.getAll();
  //       console.log("Data ",data);
        
  //       setVehicles(data.filter(v => v.status !== 'deleted'));
  //     } catch (error) {
  //       console.error('Error fetching vehicles:', error);
  //       toast.error('Failed to load vehicles');
  //     } finally {
  //       setFetchingVehicles(false);
  //     }
  //   };
  //   fetchVehicles();

  //   if (maintenance) {
  //     setFormData({
  //       vehicle_id: maintenance.vehicle_id || '',
  //       maintenance_type_id: maintenance.maintenance_type_id || '',
  //       service_date: maintenance.service_date?.split('T')[0] || new Date().toISOString().split('T')[0],
  //       odometer_km: maintenance.odometer_km || '',
  //       amount: maintenance.amount || '',
  //       vendor_name: maintenance.vendor_name || '',
  //       notes: maintenance.notes || '',
  //       status: maintenance.status || 'pending'
  //     });
  //   }
  // }, [maintenance]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.vehicle_id) {
      toast.error('Please select a vehicle');
      return;
    }
    if (!formData.maintenance_type_id) {
      toast.error('Please select maintenance type');
      return;
    }
    if (!formData.service_date) {
      toast.error('Service date is required');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!formData.odometer_km || parseFloat(formData.odometer_km) < 0) {
      toast.error('Please enter valid odometer reading');
      return;
    }

    setLoading(true);
    try {
      if (maintenance) {
        await maintenanceService.update(maintenance.id, formData);
        toast.success('Maintenance record updated successfully');
      } else {
        await maintenanceService.create(formData);
        toast.success('Maintenance record created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving maintenance:', error);
      toast.error(error.response?.data?.message || 'Failed to save maintenance record');
    } finally {
      setLoading(false);
    }
  };

  const getVehicleDisplay = (vehicle) => {
    return `${vehicle.registration_no} - ${vehicle.car_make} ${vehicle.car_model}`;
  };

  if (fetchingVehicles) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Wrench size={20} className="text-primary-600" />
            {maintenance ? 'Edit Maintenance Record' : 'New Maintenance Record'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Vehicle Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle <span className="text-red-500">*</span>
            </label>
            <select
              name="vehicle_id"
              value={formData.vehicle_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {getVehicleDisplay(vehicle)}
                </option>
              ))}
            </select>
          </div>

          {/* Maintenance Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maintenance Type <span className="text-red-500">*</span>
            </label>
            <select
              name="maintenance_type_id"
              value={formData.maintenance_type_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select maintenance type</option>
              {MAINTENANCE_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Service Date & Odometer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="service_date"
                  value={formData.service_date}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Odometer (KM) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Car size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="odometer_km"
                  value={formData.odometer_km}
                  onChange={handleChange}
                  step="1"
                  min="0"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Current odometer reading"
                  required
                />
              </div>
            </div>
          </div>

          {/* Amount & Vendor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (PKR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0.01"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter amount"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name
              </label>
              <input
                type="text"
                name="vendor_name"
                value={formData.vendor_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Service provider name"
              />
            </div>
          </div>

          {/* Status (for edit only) */}
          {maintenance && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Additional details about the maintenance..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white py-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {maintenance ? 'Update' : 'Save'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}