// frontend/src/components/return/ReturnForm.jsx
import { useState, useEffect } from 'react';
import { Car, Calendar, Fuel, Gauge, User, AlertTriangle, DollarSign, Clock, FileText } from 'lucide-react';
import { moduleApi } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import toast from 'react-hot-toast';

export default function ReturnForm({ config, editingRecord, onSuccess, onCancelEdit }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [calculations, setCalculations] = useState({
    base_amount: 0,
    total_paid: 0,
    extra_charges: 0,
    damage_charges: 0,
    late_days: 0,
    late_charges: 0,
    final_amount: 0,
    balance_amount: 0
  });

  // Fetch ongoing bookings for selection
  const { data: ongoingBookings, refetch: refetchBookings } = useFetch('/bookings?status=ongoing');

  // Fetch booking details when selected
  const fetchBookingDetails = async (bookingId) => {
    if (!bookingId) return;
    
    try {
      setLoading(true);
      const response = await moduleApi.getOne('/bookings', bookingId);
      const booking = response.data;
      setSelectedBooking(booking);
      
      // Calculate total paid from booking data
      const advanceAmount = parseFloat(booking.advance_amount || 0);
      const paidAmount = parseFloat(booking.paid_amount || 0);
      const totalPaid = advanceAmount + paidAmount;
      
      // Calculate late days
      const returnDate = formData.return_date ? new Date(formData.return_date) : new Date();
      const endDate = new Date(booking.date_to);
      
      // Normalize dates (remove time)
      returnDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      
      // Calculate late days only if return date is after end date
      let lateDays = 0;
      let lateCharges = 0;
      
      if (returnDate > endDate) {
        const diffTime = returnDate - endDate;
        lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const dailyRate = parseFloat(booking.rate_per_day || 0);
        lateCharges = lateDays * dailyRate * 1.5; // 50% extra for late return
      }
      
      // Get extra and damage charges from form data
      const extraCharges = parseFloat(formData.extra_charges || 0);
      const damageCharges = parseFloat(formData.damage_charges || 0);
      
      // Calculate final amount
      const baseAmount = parseFloat(booking.total_amount || 0);
      const finalAmount = baseAmount + extraCharges + damageCharges + lateCharges;
      const balanceAmount = finalAmount - totalPaid;
      
      setCalculations({
        base_amount: baseAmount,
        total_paid: totalPaid,
        extra_charges: extraCharges,
        damage_charges: damageCharges,
        late_days: lateDays,
        late_charges: lateCharges,
        final_amount: finalAmount,
        balance_amount: balanceAmount
      });
      
    } catch (error) {
      console.error('Failed to fetch booking details:', error);
      toast.error('Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  // Initialize form
  useEffect(() => {
    const initialData = {
      booking_id: '',
      return_date: new Date().toISOString().slice(0, 16),
      odometer_in: '',
      fuel_level_in: '',
      extra_charges: 0,
      damage_charges: 0,
      damage_notes: '',
      notes: '',
      returned_by: ''
    };

    if (editingRecord) {
      Object.keys(initialData).forEach(key => {
        if (editingRecord[key] !== undefined && editingRecord[key] !== null) {
          initialData[key] = editingRecord[key];
        }
      });
      if (editingRecord.booking_id) {
        fetchBookingDetails(editingRecord.booking_id);
      }
    }

    setFormData(initialData);
  }, [editingRecord]);

  const handleBookingChange = async (bookingId) => {
    setFormData(prev => ({ ...prev, booking_id: bookingId }));
    if (bookingId) {
      await fetchBookingDetails(bookingId);
    } else {
      setSelectedBooking(null);
      setCalculations({
        base_amount: 0,
        total_paid: 0,
        extra_charges: 0,
        damage_charges: 0,
        late_days: 0,
        late_charges: 0,
        final_amount: 0,
        balance_amount: 0
      });
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Recalculate when relevant fields change
    if (name === 'extra_charges' || name === 'damage_charges' || name === 'return_date') {
      setTimeout(() => {
        if (selectedBooking) {
          const extraCharges = name === 'extra_charges' ? parseFloat(value || 0) : parseFloat(formData.extra_charges || 0);
          const damageCharges = name === 'damage_charges' ? parseFloat(value || 0) : parseFloat(formData.damage_charges || 0);
          
          let returnDate = name === 'return_date' ? new Date(value) : new Date(formData.return_date);
          const endDate = new Date(selectedBooking.date_to);
          
          // Normalize dates
          returnDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          
          // Calculate late days
          let lateDays = 0;
          let lateCharges = 0;
          
          if (returnDate > endDate) {
            const diffTime = returnDate - endDate;
            lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const dailyRate = parseFloat(selectedBooking.rate_per_day || 0);
            lateCharges = lateDays * dailyRate * 1.5;
          }
          
          const baseAmount = parseFloat(selectedBooking.total_amount || 0);
          const finalAmount = baseAmount + extraCharges + damageCharges + lateCharges;
          const balanceAmount = finalAmount - calculations.total_paid;
          
          setCalculations(prev => ({
            ...prev,
            extra_charges: extraCharges,
            damage_charges: damageCharges,
            late_days: lateDays,
            late_charges: lateCharges,
            final_amount: finalAmount,
            balance_amount: balanceAmount
          }));
        }
      }, 100);
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const requiredFields = ['booking_id', 'return_date', 'odometer_in', 'fuel_level_in'];
    const newErrors = {};

    requiredFields.forEach(field => {
      if (!formData[field]) {
        const labels = {
          booking_id: 'Booking',
          return_date: 'Return Date',
          odometer_in: 'Odometer Reading',
          fuel_level_in: 'Fuel Level'
        };
        newErrors[field] = `${labels[field]} is required`;
      }
    });

    // Validate return date is not in future
    if (formData.return_date) {
      const returnDate = new Date(formData.return_date);
      const now = new Date();
      if (returnDate > now) {
        newErrors.return_date = 'Return date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    // Confirm if there's a balance due
    if (calculations.balance_amount > 0) {
      const confirmMessage = `Balance amount of Rs. ${calculations.balance_amount.toLocaleString()} is due.\n\nDo you want to proceed with return?`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    setLoading(true);

    try {
      const submitData = {
        booking_id: parseInt(formData.booking_id),
        return_date: formData.return_date,
        odometer_in: parseInt(formData.odometer_in),
        fuel_level_in: formData.fuel_level_in,
        extra_charges: parseFloat(formData.extra_charges || 0),
        damage_charges: parseFloat(formData.damage_charges || 0),
        damage_notes: formData.damage_notes || null,
        notes: formData.notes || null,
        returned_by: formData.returned_by || null,
        // Calculate final amount and balance
        total_days: selectedBooking?.total_days,
        late_days: calculations.late_days,
        final_amount: calculations.final_amount,
        balance_amount: calculations.balance_amount > 0 ? calculations.balance_amount : 0,
        paid_amount: calculations.total_paid
      };

      console.log('Submitting return data:', submitData);

      if (editingRecord) {
        await moduleApi.update('/return', editingRecord.id, submitData);
        toast.success('Return updated successfully');
      } else {
        await moduleApi.create('/return', submitData);
        toast.success('Vehicle returned successfully');
        
        // Update booking status to completed
        await moduleApi.patch(`/bookings/${formData.booking_id}/status`, { status: 'completed' });
      }

      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to process return');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {editingRecord ? 'Edit Vehicle Return' : 'Vehicle Return'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Process vehicle return and calculate final charges
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Booking Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Ongoing Booking <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.booking_id || ""}
                onChange={(e) => handleBookingChange(parseInt(e.target.value))}
                className={`w-full rounded-xl border ${errors.booking_id ? 'border-red-500' : 'border-slate-200'} bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
              >
                <option value="">Select Ongoing Booking</option>
                {ongoingBookings?.map(booking => (
                  <option key={booking.id} value={booking.id}>
                    {booking.booking_code} - {booking.customer_name} ({booking.car_make} {booking.car_model})
                  </option>
                ))}
              </select>
              {errors.booking_id && <p className="text-xs text-red-500">{errors.booking_id}</p>}
            </div>

            {/* Return Date & Time */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Return Date & Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="datetime-local"
                  value={formData.return_date || ''}
                  onChange={(e) => handleChange('return_date', e.target.value)}
                  className={`w-full rounded-xl border ${errors.return_date ? 'border-red-500' : 'border-slate-200'} bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
                />
              </div>
              {errors.return_date && <p className="text-xs text-red-500">{errors.return_date}</p>}
            </div>

            {/* Odometer In */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Odometer Reading (km) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="number"
                  value={formData.odometer_in || ''}
                  onChange={(e) => handleChange('odometer_in', parseInt(e.target.value))}
                  className={`w-full rounded-xl border ${errors.odometer_in ? 'border-red-500' : 'border-slate-200'} bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
                  placeholder="e.g., 15500"
                  min="0"
                />
              </div>
              {errors.odometer_in && <p className="text-xs text-red-500">{errors.odometer_in}</p>}
            </div>

            {/* Fuel Level In */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Fuel Level <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  value={formData.fuel_level_in || ''}
                  onChange={(e) => handleChange('fuel_level_in', e.target.value)}
                  className={`w-full rounded-xl border ${errors.fuel_level_in ? 'border-red-500' : 'border-slate-200'} bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
                >
                  <option value="">Select Fuel Level</option>
                  <option value="Full">Full</option>
                  <option value="3/4">3/4 Tank</option>
                  <option value="1/2">1/2 Tank</option>
                  <option value="1/4">1/4 Tank</option>
                  <option value="Empty">Empty</option>
                </select>
              </div>
              {errors.fuel_level_in && <p className="text-xs text-red-500">{errors.fuel_level_in}</p>}
            </div>

            {/* Extra Charges */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Extra Charges
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="number"
                  value={formData.extra_charges || 0}
                  onChange={(e) => handleChange('extra_charges', parseFloat(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500"
                  placeholder="0"
                  min="0"
                  step="100"
                />
              </div>
            </div>

            {/* Damage Charges */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Damage Charges
              </label>
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="number"
                  value={formData.damage_charges || 0}
                  onChange={(e) => handleChange('damage_charges', parseFloat(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500"
                  placeholder="0"
                  min="0"
                  step="100"
                />
              </div>
            </div>

            {/* Damage Notes */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Damage Notes
              </label>
              <textarea
                value={formData.damage_notes || ''}
                onChange={(e) => handleChange('damage_notes', e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500"
                placeholder="Describe any damages to the vehicle..."
              />
            </div>

            {/* Return Notes */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Return Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500"
                placeholder="Additional notes about the return..."
              />
            </div>

            {/* Returned By */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Returned By
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={formData.returned_by || ''}
                  onChange={(e) => handleChange('returned_by', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500"
                  placeholder="Staff name"
                />
              </div>
            </div>
          </div>

          {/* Booking Details and Calculations */}
          {selectedBooking && (
            <div className="mt-6 space-y-4">
              {/* Booking Info */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">Booking Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Customer:</span>
                    <div className="font-semibold text-blue-900">{selectedBooking.customer_name}</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Vehicle:</span>
                    <div className="font-semibold text-blue-900">{selectedBooking.car_make} {selectedBooking.car_model}</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Registration:</span>
                    <div className="font-semibold text-blue-900">{selectedBooking.registration_no}</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Booking Period:</span>
                    <div className="font-semibold text-blue-900">
                      {new Date(selectedBooking.date_from).toLocaleDateString()} - {new Date(selectedBooking.date_to).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <h3 className="text-sm font-semibold text-green-900 mb-3">Payment Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Base Amount:</span>
                    <div className="font-semibold text-green-900">Rs. {calculations.base_amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-green-700">Advance Paid:</span>
                    <div className="font-semibold text-green-900">Rs. {parseFloat(selectedBooking.advance_amount || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-green-700">Security Paid:</span>
                    <div className="font-semibold text-green-900">Rs. {parseFloat(selectedBooking.paid_amount || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-green-700">Total Paid:</span>
                    <div className="font-semibold text-green-900">Rs. {calculations.total_paid.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Additional Charges */}
              {(calculations.late_days > 0 || calculations.extra_charges > 0 || calculations.damage_charges > 0) && (
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  <h3 className="text-sm font-semibold text-yellow-900 mb-3">Additional Charges</h3>
                  <div className="space-y-2 text-sm">
                    {calculations.late_days > 0 && (
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Late Return ({calculations.late_days} days):</span>
                        <span className="font-semibold text-yellow-900">Rs. {calculations.late_charges.toLocaleString()}</span>
                      </div>
                    )}
                    {calculations.extra_charges > 0 && (
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Extra Charges:</span>
                        <span className="font-semibold text-yellow-900">Rs. {calculations.extra_charges.toLocaleString()}</span>
                      </div>
                    )}
                    {calculations.damage_charges > 0 && (
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Damage Charges:</span>
                        <span className="font-semibold text-yellow-900">Rs. {calculations.damage_charges.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Final Calculation */}
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <h3 className="text-sm font-semibold text-purple-900 mb-3">Final Settlement</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-purple-700">Final Amount:</span>
                    <div className="font-bold text-xl text-purple-900">Rs. {calculations.final_amount.toLocaleString()}</div>
                    <div className="text-xs text-purple-600 mt-1">
                      Base + Late + Extra + Damage
                    </div>
                  </div>
                  <div>
                    <span className="text-purple-700">Total Paid:</span>
                    <div className="font-bold text-xl text-purple-900">Rs. {calculations.total_paid.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-purple-700">Balance:</span>
                    <div className={`font-bold text-xl ${calculations.balance_amount > 0 ? 'text-red-600' : calculations.balance_amount < 0 ? 'text-green-600' : 'text-purple-900'}`}>
                      {calculations.balance_amount > 0 ? 'Due: ' : calculations.balance_amount < 0 ? 'Refund: ' : 'Settled: '}
                      Rs. {Math.abs(calculations.balance_amount).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
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
            disabled={loading || !selectedBooking}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                {editingRecord ? 'Updating...' : 'Process Return...'}
              </>
            ) : (
              <>{editingRecord ? 'Update Return' : 'Complete Return'}</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}