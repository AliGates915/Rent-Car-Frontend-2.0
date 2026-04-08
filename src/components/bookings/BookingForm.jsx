// frontend/src/components/bookings/BookingForm.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Calendar, Car, User, MapPin, DollarSign, CreditCard } from 'lucide-react';
import { moduleApi } from '../../services/api';
import useFetch from '../../hooks/useFetch';

export default function BookingForm({ config, editingRecord, onSuccess, onCancelEdit }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Fetch customers and vehicles
  const { data: customers } = useFetch('/customers');
  const { data: vehicles } = useFetch('/vehicles/free');

  // Initialize form
  useEffect(() => {
    const initialData = {
      customer_id: '',
      vehicle_id: '',
      date_from: '',
      date_to: '',
      pickup_city: '',
      dropoff_city: '',
      upfront_payment: 0,
      advance_amount: 0,
      security_deposit: 0,
      status: 'pending',
      payment_status: 'unpaid'
    };

    if (editingRecord) {
      Object.keys(initialData).forEach(key => {
        if (editingRecord[key] !== undefined && editingRecord[key] !== null) {
          // Special handling for dates
          if (key === 'date_from' || key === 'date_to') {
            const dateValue = editingRecord[key];
            if (dateValue) {
              const date = new Date(dateValue);
              const year = date.getUTCFullYear();
              const month = String(date.getUTCMonth() + 1).padStart(2, '0');
              const day = String(date.getUTCDate()).padStart(2, '0');
              initialData[key] = `${year}-${month}-${day}`;
            }
          } else if (key === 'status') {
            // Don't allow editing ongoing/completed status in form
            const status = editingRecord[key];
            if (status === 'ongoing' || status === 'completed') {
              initialData[key] = status;
              // Show a message that status can't be changed
              toast.error(`${status.toUpperCase()} status cannot be changed manually`, { duration: 3000 });
            } else {
              initialData[key] = status;
            }
          } else {
            initialData[key] = editingRecord[key];
          }
        }
      });
    }

    setFormData(initialData);
  }, [editingRecord]);


  // Check vehicle availability when dates change
  useEffect(() => {
    const checkAvailability = async () => {
      if (formData.date_from && formData.date_to && formData.vehicle_id) {
        setCheckingAvailability(true);
        try {
          const response = await moduleApi.getAll('/bookings/available', {
            params: {
              date_from: formData.date_from,
              date_to: formData.date_to,
              vehicle_id: formData.vehicle_id
            }
          });
          setAvailableVehicles(response.data || []);
        } catch (error) {
          console.error('Error checking availability:', error);
        } finally {
          setCheckingAvailability(false);
        }
      }
    };

    const timer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timer);
  }, [formData.date_from, formData.date_to, formData.vehicle_id]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  useEffect(() => {
    const advance = Number(formData.advance_amount || 0);
    const deposit = Number(formData.security_deposit || 0);
    const totalUpfront = advance + deposit;

    setFormData(prev => ({
      ...prev,
      upfront_payment: totalUpfront
    }));
  }, [formData.advance_amount, formData.security_deposit]);



  const validateForm = () => {
    const requiredFields = ['customer_id', 'vehicle_id', 'date_from', 'date_to', 'pickup_city', 'dropoff_city'];
    const newErrors = {};

    requiredFields.forEach(field => {
      if (!formData[field]) {
        const labels = {
          customer_id: 'Customer',
          vehicle_id: 'Vehicle',
          date_from: 'Start Date',
          date_to: 'End Date',
          pickup_city: 'Pickup City',
          dropoff_city: 'Dropoff City'
        };
        newErrors[field] = `${labels[field]} is required`;
      }
    });

    // Validate dates
    if (formData.date_from && formData.date_to) {
      const start = new Date(formData.date_from);
      const end = new Date(formData.date_to);
      if (end <= start) {
        newErrors.date_to = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalDays = () => {
    if (formData.date_from && formData.date_to) {
      const start = new Date(formData.date_from);
      const end = new Date(formData.date_to);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      // Calculate upfront payment
      const advanceAmount = Number(formData.advance_amount || 0);
      const securityDeposit = Number(formData.security_deposit || 0);
      const upfrontPayment = advanceAmount + securityDeposit;

      // Format dates to YYYY-MM-DD without timezone
      const formatDateForAPI = (dateString) => {
        if (!dateString) return '';
        // If it's already in YYYY-MM-DD format, return as is
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return dateString;
        }
        // Otherwise, parse and format
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Prepare submission data
      const submitData = {
        customer_id: formData.customer_id,
        vehicle_id: formData.vehicle_id,
        date_from: formatDateForAPI(formData.date_from),
        date_to: formatDateForAPI(formData.date_to),
        pickup_city: formData.pickup_city,
        dropoff_city: formData.dropoff_city,
        advance_amount: advanceAmount,
        security_deposit: securityDeposit,
        upfront_payment: upfrontPayment,
        status: formData.status || 'pending',
        payment_status: formData.payment_status || 'unpaid'
      };

      console.log('Submitting data:', submitData); // Debug log

      if (editingRecord) {
        await moduleApi.update('/bookings', editingRecord.id, submitData);
        toast.success('Booking updated successfully');
      } else {
        await moduleApi.create('/bookings', submitData);
        toast.success('Booking created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to save booking');
    } finally {
      setLoading(false);
    }
  };


  const totalDays = calculateTotalDays();


  const selectedVehicle = vehicles?.find(
    (v) => v.id === formData.vehicle_id
  );

  const ratePerDay = Number(selectedVehicle?.rate_per_day || 0);
  const totalAmount = ratePerDay * totalDays;


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {editingRecord ? 'Edit Booking' : 'New Booking'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Create a new vehicle booking for customer
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Customer Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Customer <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  value={formData.customer_id || ""}
                  onChange={(e) => handleChange('customer_id', parseInt(e.target.value))}
                  className={`w-full rounded-xl border ${errors.customer_id ? 'border-red-500' : 'border-slate-200'} bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
                >
                  <option value="">Select Customer</option>
                  {customers?.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.id} - {customer.customer_name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.customer_id && <p className="text-xs text-red-500">{errors.customer_id}</p>}
            </div>

            {/* Vehicle Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Vehicle <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  value={formData.vehicle_id || ""}
                  onChange={(e) => handleChange('vehicle_id', parseInt(e.target.value))}
                  className={`w-full rounded-xl border ${errors.vehicle_id ? 'border-red-500' : 'border-slate-200'} bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
                >
                  <option value="">Select Vehicle</option>
                  {vehicles?.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.car_make} {vehicle.car_model} ({vehicle.registration_no})
                    </option>
                  ))}
                </select>
              </div>
              {errors.vehicle_id && <p className="text-xs text-red-500">{errors.vehicle_id}</p>}
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="date"
                  value={formData.date_from || ''}
                  onChange={(e) => handleChange('date_from', e.target.value)}
                  className={`w-full rounded-xl border ${errors.date_from ? 'border-red-500' : 'border-slate-200'} bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {errors.date_from && <p className="text-xs text-red-500">{errors.date_from}</p>}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                End Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="date"
                  value={formData.date_to || ''}
                  onChange={(e) => handleChange('date_to', e.target.value)}
                  className={`w-full rounded-xl border ${errors.date_to ? 'border-red-500' : 'border-slate-200'} bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
                  min={formData.date_from || new Date().toISOString().split('T')[0]}
                />
              </div>
              {errors.date_to && <p className="text-xs text-red-500">{errors.date_to}</p>}
            </div>

            {/* Pickup City */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Pickup City <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={formData.pickup_city || ''}
                  onChange={(e) => handleChange('pickup_city', e.target.value)}
                  className={`w-full rounded-xl border ${errors.pickup_city ? 'border-red-500' : 'border-slate-200'} bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
                  placeholder="e.g., Lahore"
                />
              </div>
              {errors.pickup_city && <p className="text-xs text-red-500">{errors.pickup_city}</p>}
            </div>

            {/* Dropoff City */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Dropoff City <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={formData.dropoff_city || ''}
                  onChange={(e) => handleChange('dropoff_city', e.target.value)}
                  className={`w-full rounded-xl border ${errors.dropoff_city ? 'border-red-500' : 'border-slate-200'} bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
                  placeholder="e.g., Lahore"
                />
              </div>
              {errors.dropoff_city && <p className="text-xs text-red-500">{errors.dropoff_city}</p>}
            </div>

            {/* Advance Amount */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Advance Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="number"
                  value={formData.advance_amount || ''}
                  onChange={(e) => handleChange('advance_amount', parseFloat(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Security Deposit */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Security Deposit
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="number"
                  value={formData.security_deposit || ''}
                  onChange={(e) => handleChange('security_deposit', parseFloat(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                value={formData.status || 'pending'}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                {/* Disable ongoing and completed for manual selection */}
                <option value="ongoing" disabled className="text-slate-400">
                  Ongoing (Via Handover)
                </option>
                <option value="completed" disabled className="text-slate-400">
                  Completed (Via Return)
                </option>
                <option value="cancelled">Cancelled</option>
              </select>
              {formData.status === 'ongoing' && (
                <p className="text-xs text-blue-600 mt-1">
                  ⓘ Ongoing status is managed through vehicle handover
                </p>
              )}
              {formData.status === 'completed' && (
                <p className="text-xs text-green-600 mt-1">
                  ⓘ Completed status is managed through vehicle return
                </p>
              )}
            </div>

            {/* Payment Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Payment Status
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  value={formData.payment_status || 'unpaid'}
                  onChange={(e) => handleChange('payment_status', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          {totalDays > 0 && formData.vehicle_id && selectedVehicle && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Booking Summary
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm">

                {/* Total Days */}
                <div>
                  <span className="text-blue-700">Total Days:</span>
                  <span className="ml-2 font-semibold text-blue-900">
                    {totalDays} days
                  </span>
                </div>

                {/* Total Amount */}
                <div>
                  <span className="text-blue-700">Total Amount:</span>
                  <span className="ml-2 font-semibold text-blue-900">
                    {ratePerDay} × {totalDays} = {totalAmount}
                  </span>
                </div>

                {/* Vehicle */}
                <div className="col-span-2">
                  <span className="text-blue-700">Vehicle:</span>
                  <span className="ml-2 font-semibold text-blue-900">
                    {selectedVehicle.car_make} {selectedVehicle.car_model}
                  </span>
                </div>

              </div>
            </div>
          )}

          {/* Availability Warning */}
          {checkingAvailability && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
              Checking vehicle availability...
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                {editingRecord ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{editingRecord ? 'Update Booking' : 'Create Booking'}</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}