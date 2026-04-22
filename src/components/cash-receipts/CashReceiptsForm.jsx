// frontend/src/components/cash-receipts/CashReceiptsForm.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { X, Search, User, AlertCircle, ChevronDown, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { cashReceiptApi } from '../../services/api';

export default function CashReceiptsForm({ config, editingRecord, onSuccess, onCancelEdit }) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerBookings, setCustomerBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [paymentDistribution, setPaymentDistribution] = useState(null);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: editingRecord || {
      source: 'booking',
      payment_method: 'cash'
    }
  });

  const source = watch('source');
  const amount = watch('amount');

  // Fetch customers with balance (only those who have balance)
  const fetchCustomers = async (searchTerm = '') => {
    setLoadingCustomers(true);
    try {
      const response = await cashReceiptApi.getCustomersWithBalance(searchTerm);
      const allCustomers = response.data.data || [];
      
      // Filter only customers with balance > 0
      const customersWithBalance = allCustomers.filter(c => Math.abs(c.balance) > 0);
      setCustomers(customersWithBalance);
      setFilteredCustomers(customersWithBalance);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Filter customers based on search
  useEffect(() => {
    if (customerSearch.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer => 
        customer.customer_name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.phone_no?.includes(customerSearch) ||
        customer.cnic_no?.includes(customerSearch)
      );
      setFilteredCustomers(filtered);
    }
  }, [customerSearch, customers]);

  // Fetch customer bookings with payment status and owner earnings info
  const fetchCustomerBookings = async (customerId) => {
    try {
      const response = await cashReceiptApi.getCustomerBalance(customerId);
      if (response.data.success) {
        setSelectedCustomer(response.data.customer);
        // Filter only bookings with remaining amount > 0
        const unpaidBookings = (response.data.bookings || []).filter(b => b.remaining_amount > 0);
        
        // Enhance bookings with owner earnings info
        const enhancedBookings = unpaidBookings.map(booking => ({
          ...booking,
          owner_remaining: booking.owner_earnings?.owner_amount || 0,
          company_remaining: booking.owner_earnings?.company_amount || 0
        }));
        
        setCustomerBookings(enhancedBookings);
        
        // Auto-select booking if only one exists
        if (enhancedBookings.length === 1) {
          const booking = enhancedBookings[0];
          setSelectedBooking(booking);
          setValue('reference_id', booking.id);
          setRemainingAmount(booking.remaining_amount);
          setPaymentDistribution(null);
        } else {
          setSelectedBooking(null);
          setRemainingAmount(0);
          setPaymentDistribution(null);
        }
      }
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      toast.error('Failed to load customer bookings');
    }
  };

  // Calculate payment distribution preview
  useEffect(() => {
    if (selectedBooking && amount && amount > 0) {
      const paymentAmount = parseFloat(amount);
      const maxAmount = selectedBooking.remaining_amount;
      
      if (paymentAmount <= maxAmount) {
        // Calculate how this payment will be distributed
        let remainingPayment = paymentAmount;
        let companyPaid = 0;
        let ownerPaid = 0;
        
        // First pay company share
        const companyRemaining = selectedBooking.company_remaining || 0;
        if (remainingPayment > 0 && companyRemaining > 0) {
          companyPaid = Math.min(remainingPayment, companyRemaining);
          remainingPayment -= companyPaid;
        }
        
        // Then pay owner share
        const ownerRemaining = selectedBooking.owner_remaining || 0;
        if (remainingPayment > 0 && ownerRemaining > 0) {
          ownerPaid = Math.min(remainingPayment, ownerRemaining);
          remainingPayment -= ownerPaid;
        }
        
        setPaymentDistribution({
          companyPaid,
          ownerPaid,
          willBeFullyPaid: (companyRemaining - companyPaid) === 0 && (ownerRemaining - ownerPaid) === 0
        });
      } else {
        setPaymentDistribution(null);
      }
    } else {
      setPaymentDistribution(null);
    }
  }, [amount, selectedBooking]);

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.customer_name);
    setShowCustomerDropdown(false);
    setValue('customer_id', customer.id);
    setValue('received_from', customer.customer_name);
    fetchCustomerBookings(customer.id);
  };

  // Handle booking selection
  const handleBookingSelect = (booking) => {
    setSelectedBooking(booking);
    setValue('reference_id', booking.id);
    setRemainingAmount(booking.remaining_amount);
    setPaymentDistribution(null);
  };

  // Calculate max amount (remaining amount of selected booking)
  const maxAmount = selectedBooking ? selectedBooking.remaining_amount : 0;

  const onSubmit = async (data) => {
    // Validate amount doesn't exceed remaining balance
    if (source === 'booking' && selectedBooking && parseFloat(data.amount) > selectedBooking.remaining_amount) {
      toast.error(`Amount cannot exceed remaining balance of ₨${selectedBooking.remaining_amount.toLocaleString()}`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amount: parseFloat(data.amount),
        source: data.source,
        payment_method: data.payment_method,
        notes: data.notes
      };

      // Add reference_id if booking source
      if (data.source === 'booking' && data.reference_id) {
        payload.reference_id = data.reference_id;
      }

      // Add customer_id if provided
      if (data.customer_id) {
        payload.customer_id = data.customer_id;
      }

      let response;
      if (editingRecord?.id) {
        response = await cashReceiptApi.updateReceipt(editingRecord.id, payload);
        toast.success('Cash receipt updated successfully');
      } else {
        response = await cashReceiptApi.createReceipt(payload);
        toast.success('Cash receipt created successfully');
        
        // Show payment distribution details if available
        if (response.data.earnings_distribution) {
          const dist = response.data.earnings_distribution;
          toast.success(
            `Payment distributed: Company ₨${dist.companyPaid.toLocaleString()} | Owner ₨${dist.ownerPaid.toLocaleString()}`,
            { duration: 5000 }
          );
        }
      }
      
      reset();
      setSelectedCustomer(null);
      setSelectedBooking(null);
      setRemainingAmount(0);
      setPaymentDistribution(null);
      setCustomerSearch('');
      onSuccess();
    } catch (error) {
      console.error('Error saving cash receipt:', error);
      toast.error(error.response?.data?.message || 'Failed to save cash receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {editingRecord ? 'Edit Cash Receipt' : 'Add New Cash Receipt'}
        </h2>
        <button
          type="button"
          onClick={onCancelEdit}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receipt Type *
            </label>
            <select
              {...register('source', { required: 'Source is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="booking">Booking Payment</option>
              <option value="general">General Receipt</option>
            </select>
            {errors.source && (
              <p className="mt-1 text-sm text-red-600">{errors.source.message}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              {...register('payment_method', { required: 'Payment method is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="easypaisa">EasyPaisa</option>
              <option value="jazzcash">JazzCash</option>
            </select>
            {errors.payment_method && (
              <p className="mt-1 text-sm text-red-600">{errors.payment_method.message}</p>
            )}
          </div>

          {/* Customer Selection (for booking type) */}
          {source === 'booking' && (
            <>
              <div className="relative md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Customer *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => {
                      setShowCustomerDropdown(true);
                      fetchCustomers();
                    }}
                    className="w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search customer by name, phone or CNIC..."
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={18} />
                </div>
                
                {showCustomerDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-auto">
                    {loadingCustomers ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <p className="mt-2">Loading customers...</p>
                      </div>
                    ) : filteredCustomers.length > 0 ? (
                      <>
                        <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
                          <p className="text-xs font-medium text-gray-500">
                            {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} with balance
                          </p>
                        </div>
                        {filteredCustomers.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => handleCustomerSelect(customer)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                          >
                            <div className="font-medium text-gray-900">{customer.customer_name}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              <span>{customer.phone_no || 'No phone'}</span>
                              {customer.cnic_no && <span className="mx-2">•</span>}
                              {customer.cnic_no && <span>{customer.cnic_no}</span>}
                            </div>
                            <div className="text-sm mt-1">
                              <span className="text-gray-600">Balance:</span>{' '}
                              <span className="font-semibold text-red-600">
                                ₨{customer.balance?.toLocaleString() || 0}
                              </span>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-gray-500">No customers with balance found</p>
                        {customerSearch && (
                          <p className="text-sm text-gray-400 mt-1">
                            Try a different search term
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {errors.customer_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer_id.message}</p>
                )}
              </div>

              {/* Customer Balance Display */}
              {selectedCustomer && (
                <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <User size={18} className="text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">Selected Customer Details</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="text-sm font-medium text-gray-900">{selectedCustomer.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{selectedCustomer.phone_no || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">CNIC</p>
                      <p className="text-sm font-medium text-gray-900">{selectedCustomer.cnic_no || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Outstanding Balance</p>
                      <p className="text-sm font-bold text-red-600">
                        ₨{selectedCustomer.balance?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Selection */}
              {selectedCustomer && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Booking (Unpaid/Partial) *
                  </label>
                  {customerBookings.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-auto">
                      {customerBookings.map((booking) => (
                        <label
                          key={booking.id}
                          className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedBooking?.id === booking.id
                              ? 'border-blue-500 bg-blue-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="booking"
                              checked={selectedBooking?.id === booking.id}
                              onChange={() => handleBookingSelect(booking)}
                              className="mt-1.5"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {booking.booking_code}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-0.5">
                                    {booking.car_make} {booking.car_model} • {booking.registration_no}
                                  </div>
                                </div>
                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                  booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                  booking.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {booking.payment_status?.toUpperCase()}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                                <div>
                                  <span className="text-gray-500">Total:</span>
                                  <p className="font-medium text-gray-900">₨{booking.total_amount?.toLocaleString()}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Paid:</span>
                                  <p className="font-medium text-green-600">₨{(booking.paid_amount)?.toLocaleString()}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Remaining:</span>
                                  <p className="font-medium text-red-600">₨{booking.remaining_amount?.toLocaleString()}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Duration:</span>
                                  <p className="font-medium text-gray-700 text-xs">
                                    {new Date(booking.date_from).toLocaleDateString()} - {new Date(booking.date_to).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Owner Earnings Info */}
                              {(booking.owner_remaining > 0 || booking.company_remaining > 0) && (
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                  <p className="text-xs font-medium text-gray-700 mb-2">Outstanding Distribution:</p>
                                  <div className="flex gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">Company Share:</span>
                                      <p className="font-semibold text-blue-600">₨{booking.company_remaining?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Owner Share:</span>
                                      <p className="font-semibold text-purple-600">₨{booking.owner_remaining?.toLocaleString()}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <AlertCircle size={20} className="text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">No pending payments!</p>
                        <p className="text-xs text-green-600 mt-0.5">
                          This customer has cleared all their booking payments.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Received From (for general receipt) */}
          {source === 'general' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Received From *
              </label>
              <input
                type="text"
                {...register('received_from', { required: 'Received from is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter customer or party name"
              />
              {errors.received_from && (
                <p className="mt-1 text-sm text-red-600">{errors.received_from.message}</p>
              )}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('amount', { 
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' },
                max: source === 'booking' && maxAmount > 0 ? { 
                  value: maxAmount, 
                  message: `Amount cannot exceed remaining balance of ₨${maxAmount.toLocaleString()}` 
                } : undefined
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
            {source === 'booking' && selectedBooking && (
              <p className="mt-1 text-sm text-blue-600">
                Maximum allowed: <span className="font-semibold">₨{maxAmount.toLocaleString()}</span> (Remaining balance)
              </p>
            )}
          </div>

        

          {/* Hidden fields */}
          <input type="hidden" {...register('customer_id')} />
          <input type="hidden" {...register('reference_id')} />

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes or comments..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : editingRecord ? 'Update Receipt' : 'Process Payment'}
          </button>
        </div>
      </form>
    </div>
  );
}