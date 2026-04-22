// frontend/src/components/handover/HandoverForm.jsx
import { useState, useEffect } from 'react';
import { Car, Clock, Calendar, Fuel, Gauge, User, PenTool, Signature, Package, AlertCircle } from 'lucide-react';
import { moduleApi } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import toast from 'react-hot-toast';

export default function HandoverForm({ config, editingRecord, onSuccess, onCancelEdit }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [accessories, setAccessories] = useState([]);
  const [availableAccessories, setAvailableAccessories] = useState([]);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [handoverWarning, setHandoverWarning] = useState(null);
  const [maxHandoverDate, setMaxHandoverDate] = useState('');

  // Fetch confirmed bookings for selection
  const { data: confirmedBookings } = useFetch('/bookings/confirmed');
  console.log("Confirm ", confirmedBookings);

  // Fetch accessories list
  useEffect(() => {
    const fetchAccessories = async () => {
      try {
        const response = await moduleApi.getAll('/accessory-types');
        setAvailableAccessories(response.data || []);
        if (response.data && response.data.length > 0) {
          setAccessories(response.data.map(acc => ({
            accessory_type_id: acc.id,
            accessory_name: acc.name,
            is_given: false,
            remarks: ''
          })));
        }
      } catch (error) {
        const defaultAccessories = [
          { id: 1, name: 'Spare Tire' },
          { id: 2, name: 'Tool Kit' },
          { id: 3, name: 'First Aid Kit' },
          { id: 4, name: 'Fire Extinguisher' },
          { id: 5, name: 'Jack' }
        ];
        setAvailableAccessories(defaultAccessories);
        setAccessories(defaultAccessories.map(acc => ({
          accessory_type_id: acc.id,
          accessory_name: acc.name,
          is_given: false,
          remarks: ''
        })));
      }
    };
    fetchAccessories();
  }, []);

  // Initialize form
  useEffect(() => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const initialData = {
      booking_id: '',
      vehicle_id: '',
      handed_over_by: '',
      handover_date: formattedDate,
      handover_time: formattedTime,
      km_out: '',
      fuel_level_out: '',
      vehicle_out_notes: '',
      customer_signature_url: '',
      staff_signature_url: ''
    };

    if (editingRecord) {
      Object.keys(initialData).forEach(key => {
        if (editingRecord[key] !== undefined && editingRecord[key] !== null) {
          initialData[key] = editingRecord[key];
        }
      });
    }

    setFormData(initialData);
  }, [editingRecord]);

  // Auto-populate vehicle and validate handover date when booking is selected
  const handleBookingChange = async (bookingId) => {
    if (bookingId) {
      const response = await moduleApi.getOne('/bookings', bookingId);
      const booking = response.data;

      const startDate = booking.date_from.split('T')[0];

      // ✅ Only MAX date set karo
      setMaxHandoverDate(startDate);

      setFormData(prev => ({
        ...prev,
        booking_id: bookingId,
        vehicle_id: booking.vehicle_id,
        handover_date: startDate
      }));
    }
  };

  // Update validation function to use date only
  const validateHandoverDate = (handoverDate, booking = selectedBookingDetails) => {
    if (!handoverDate || !booking) return;

    const handoverDateStr = handoverDate;
    const startDateStr = booking.date_from.split('T')[0];

    let warning = null;

    if (handoverDateStr === startDateStr) {
      warning = {
        type: 'ontime',
        message: '✅ On-time handover on booking start date',
      };
    }
    else if (handoverDateStr < startDateStr) {
      warning = {
        type: 'early',
        message: '🟡 Early handover before start date',
      };
    }
    else if (handoverDateStr > startDateStr) {
      warning = {
        type: 'invalid',
        message: '❌ Handover date cannot be after start date',
      };
    }

    setHandoverWarning(warning);
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'handover_date') {
      // Clear future date error when user changes date
      setErrors(prev => ({ ...prev, handover_date: '' }));
      if (selectedBookingDetails) {
        validateHandoverDate(value, selectedBookingDetails);
      }
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAccessoryChange = (index, field, value) => {
    const updated = [...accessories];
    updated[index][field] = value;
    setAccessories(updated);
  };

  const validateForm = () => {
    const requiredFields = ['booking_id', 'vehicle_id', 'handed_over_by', 'handover_date'];
    const newErrors = {};

    requiredFields.forEach(field => {
      if (!formData[field]) {
        const labels = {
          booking_id: 'Booking',
          vehicle_id: 'Vehicle',
          handed_over_by: 'Handed Over By',
          handover_date: 'Handover Date'
        };
        newErrors[field] = `${labels[field]} is required`;
      }
    });

    // Validate handover date against booking dates
    if (selectedBookingDetails && formData.handover_date) {
      const handoverDate = new Date(formData.handover_date);
      const startDate = new Date(selectedBookingDetails.date_from.split('T')[0]);
      const endDate = new Date(selectedBookingDetails.date_to.split('T')[0]);

      // Reset time to midnight for comparison
      handoverDate.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      if (handoverDate < startDate) {
        newErrors.handover_date = `Handover date cannot be before booking start date (${startDate.toLocaleDateString()})`;
      }

      if (handoverDate > endDate) {
        newErrors.handover_date = `Handover date cannot be after booking end date (${endDate.toLocaleDateString()})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    if (handoverWarning && (handoverWarning.type === 'early' || handoverWarning.type === 'late')) {
      if (!window.confirm(`${handoverWarning.message}\n\nDo you want to proceed?`)) {
        return;
      }
    }

    setLoading(true);

    try {
      const accessoriesData = accessories
        .filter(acc => acc.is_given === true || acc.is_given === 1)
        .map(acc => ({
          accessory_type_id: acc.accessory_type_id,
          is_given: true,
          remarks: acc.remarks || null
        }));

      const submitData = {
        booking_id: parseInt(formData.booking_id),
        vehicle_id: parseInt(formData.vehicle_id),
        handed_over_by: formData.handed_over_by,
        handover_date: formData.handover_date,
        handover_time: formData.handover_time,
        km_out: parseFloat(formData.km_out),
        fuel_level_out: formData.fuel_level_out,
        vehicle_out_notes: formData.vehicle_out_notes || null,
        customer_signature_url: formData.customer_signature_url || null,
        staff_signature_url: formData.staff_signature_url || null,
        accessories: accessoriesData
      };

      if (editingRecord) {
        await moduleApi.update('/handover', editingRecord.id, submitData);
        toast.success('Handover updated successfully');
      } else {
        await moduleApi.create('/handover', submitData);
        toast.success('Vehicle handed over successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to process handover');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {editingRecord ? 'Edit Vehicle Handover' : 'Vehicle Handover'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Record vehicle handover details and accessories
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Booking Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Booking <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.booking_id || ""}
                onChange={(e) => handleBookingChange(parseInt(e.target.value))}
                className={`w-full rounded-xl border ${errors.booking_id ? 'border-red-500' : 'border-slate-200'} bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
              >
                <option value="">Select Confirmed Booking</option>
                {confirmedBookings?.map(booking => (
                  <option key={booking.id} value={booking.id}>
                    {booking.booking_code} - {booking.customer_name} ({booking.car_make} {booking.car_model})
                  </option>
                ))}
              </select>
              {errors.booking_id && <p className="text-xs text-red-500">{errors.booking_id}</p>}
            </div>

            {/* Vehicle Display */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Vehicle <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={formData.vehicle_id ? `Vehicle ID: ${formData.vehicle_id}` : ''}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-600"
                  placeholder="Vehicle will be auto-filled from booking"
                />
              </div>
            </div>

            {/* Handed Over By */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Handed Over By <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={formData.handed_over_by || ''}
                  onChange={(e) => handleChange('handed_over_by', e.target.value)}
                  className={`w-full rounded-xl border ${errors.handed_over_by ? 'border-red-500' : 'border-slate-200'} bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
                  placeholder="Staff name or ID"
                />
              </div>
              {errors.handed_over_by && <p className="text-xs text-red-500">{errors.handed_over_by}</p>}
            </div>

            {/* Handover Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Handover Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Handover Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="date"
                    value={formData.handover_date || ''}
                    onChange={(e) => {
                      handleChange('handover_date', e.target.value);
                      if (selectedBookingDetails) {
                        validateHandoverDate(e.target.value, selectedBookingDetails);
                      }
                    }}
                    // ❌ REMOVE min completely (ya optional rakho)
                    // min={minHandoverDate}

                    // ✅ ONLY THIS
                    max={maxHandoverDate}

                    className={`w-full rounded-xl border ${errors.handover_date ? 'border-red-500' : 'border-slate-200'
                      } bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
                  />
                </div>
                {errors.handover_date && <p className="text-xs text-red-500">{errors.handover_date}</p>}
              </div>

              {/* Handover Time */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Handover Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="time"
                    value={formData.handover_time || ''}
                    onChange={(e) => handleChange('handover_time', e.target.value)}
                    className={`w-full rounded-xl border ${errors.handover_time ? 'border-red-500' : 'border-slate-200'} bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
                  />
                </div>
              </div>
            </div>

            {/* Booking Date Range Display */}
            {selectedBookingDetails && (
              <div className="md:col-span-2 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium text-blue-900 mb-1">Booking Details:</div>
                  <div className="grid grid-cols-2 gap-2 text-blue-800">
                    <div>📅 Start Date: {new Date(selectedBookingDetails.date_from).toLocaleDateString()}</div>
                    <div>📅 End Date: {new Date(selectedBookingDetails.date_to).toLocaleDateString()}</div>
                    <div>💰 Total Amount: Rs. {selectedBookingDetails.total_amount?.toLocaleString()}</div>
                    <div>💵 Advance Paid: Rs. {selectedBookingDetails.advance_amount?.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Handover Warning Message */}
            {handoverWarning && (
              <div className={`md:col-span-2 p-3 rounded-lg ${handoverWarning.type === 'ontime' ? 'bg-green-50 border border-green-200' :
                handoverWarning.type === 'early' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-orange-50 border border-orange-200'
                }`}>
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className={
                    handoverWarning.type === 'ontime' ? 'text-green-600' : 'text-yellow-600'
                  } />
                  <div className="text-sm">
                    <p className={handoverWarning.type === 'ontime' ? 'text-green-800' : 'text-yellow-800'}>
                      {handoverWarning.message}
                    </p>
                    <p className="text-xs mt-1 text-slate-600">{handoverWarning.suggestion}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Odometer Out */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Odometer Reading (km) 
              </label>
              <div className="relative">
                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="number"
                  value={formData.km_out || ''}
                  onChange={(e) => handleChange('km_out', parseInt(e.target.value))}
                  className={`w-full rounded-xl border ${errors.km_out ? 'border-red-500' : 'border-slate-200'} bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
                  placeholder="e.g., 15000"
                  min="0"
                />
              </div>
            </div>

            {/* Fuel Level Out */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Fuel Level 
              </label>
              <div className="relative">
                <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  value={formData.fuel_level_out || ''}
                  onChange={(e) => handleChange('fuel_level_out', e.target.value)}
                  className={`w-full rounded-xl border ${errors.fuel_level_out ? 'border-red-500' : 'border-slate-200'} bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
                >
                  <option value="">Select Fuel Level</option>
                  <option value="Full">Full</option>
                  <option value="3/4">3/4 Tank</option>
                  <option value="1/2">1/2 Tank</option>
                  <option value="1/4">1/4 Tank</option>
                  <option value="Empty">Empty</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Handover Notes
              </label>
              <div className="relative">
                <PenTool className="absolute left-3 top-3 text-slate-400" size={18} />
                <textarea
                  value={formData.vehicle_out_notes || ''}
                  onChange={(e) => handleChange('vehicle_out_notes', e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500"
                  placeholder="Any damages, scratches, or special instructions..."
                />
              </div>
            </div>
          </div>

          {/* Accessories Section */}
          {availableAccessories.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-md font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Package size={18} />
                Vehicle Accessories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accessories.map((acc, index) => (
                  <div key={acc.accessory_type_id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={acc.is_given === true || acc.is_given === 1}
                      onChange={(e) => handleAccessoryChange(index, 'is_given', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300"
                    />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-slate-700">
                        {acc.accessory_name}
                      </label>
                      {acc.is_given && (
                        <input
                          type="text"
                          placeholder="Remarks (optional)"
                          value={acc.remarks || ''}
                          onChange={(e) => handleAccessoryChange(index, 'remarks', e.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signatures Section */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-md font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Signature size={18} />
              Signatures
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Customer Signature URL
                </label>
                <input
                  type="text"
                  value={formData.customer_signature_url || ''}
                  onChange={(e) => handleChange('customer_signature_url', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Staff Signature URL
                </label>
                <input
                  type="text"
                  value={formData.staff_signature_url || ''}
                  onChange={(e) => handleChange('staff_signature_url', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
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
                {editingRecord ? 'Updating...' : 'Handover Vehicle...'}
              </>
            ) : (
              <>{editingRecord ? 'Update Handover' : 'Complete Handover'}</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}