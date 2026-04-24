const yesNoOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];

export const moduleConfigs = {
  customers: {
    title: 'Customer Management',
    endpoint: '/customers',
    tabs: [
      { key: 'list', label: 'List' },
      { key: 'form', label: 'Form' },
      { key: 'documents', label: 'Documents' },
      { key: 'references', label: 'References' },
    ],
    fields: [
      { name: 'customer_name', label: 'Full Name', required: true, type: 'text', maxLength: 20 },
      { name: 'cnic_no', label: 'CNIC', required: true, type: 'number', maxLength: 13 },
      { name: 'phone_no', label: 'Phone', required: true, type: 'number', maxLength: 11 },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'profession', label: 'Profession', type: 'select', options: ['Driver', 'Passenger', 'Other'] },
      { name: 'balance', label: 'Balance', type: 'number', defaultValue: 0 },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'], defaultValue: 'active' },
    ],
    columns: [
      { key: 'customer_name', label: 'Customer' },
      { key: 'phone_no', label: 'Phone' },
      { key: 'cnic_no', label: 'CNIC' },
      { key: 'address', label: 'Address' },
      { key: 'profession', label: 'Profession' },
      { key: 'balance', label: 'Balance', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    filters: [{ key: 'status', label: 'Status', options: ['', 'active', 'inactive'] }],
  },

  vehicles: {
    title: 'Vehicle Management',
    endpoint: '/vehicles',
    tabs: [
      { key: 'list', label: 'List' },
      { key: 'form', label: 'Form' },
      { key: 'documents', label: 'Documents' },
    ],
    fields: [
      { name: 'registration_no', label: 'Registration No', required: true, type: 'text', maxLength: 10 },
      { name: 'owner_id', label: 'owner_id', type: 'select' },
      { name: 'car_make', label: 'Make', required: true },
      { name: 'car_model', label: 'Model', required: true, type: 'text', maxLength: 20 },
      { name: 'year_of_model', label: 'Year', type: 'number' },
      { name: 'car_type', label: 'Vehicle Type', type: 'select', options: ['Sedan', 'SUV', 'APV', 'Hatchback', 'Luxury'] },
      { name: 'rate_per_day', label: 'Rate / Day', type: 'number', required: true, defaultValue: 0 },
      { name: 'transmission_type', label: 'Transmission', type: 'select', options: ['Automatic', 'Manual'] },
      { name: 'fuel_type', label: 'Fuel Type', type: 'select', options: ['Petrol', 'Diesel', 'Hybrid', 'Electric'] },
      { name: 'location', label: 'Location' },
      { name: 'status', label: 'Status', type: 'select', options: ['available', 'on_rent', 'maintenance', 'inactive'], defaultValue: 'available' },
      { name: 'air_conditioner', label: 'Air Conditioner', type: 'checkbox', defaultValue: true },
      { name: 'android', label: 'Android Panel', type: 'checkbox' },
      { name: 'sunroof', label: 'Sun Roof', type: 'checkbox' },
      { name: 'front_camera', label: 'Front Camera', type: 'checkbox' },
      { name: 'rear_camera', label: 'Rear Camera', type: 'checkbox' },

    ],
    columns: [
      { key: 'registration_no', label: 'Registration' },
      { key: 'car_make', label: 'Make' },
      { key: 'car_model', label: 'Model' },
      { key: 'rate_per_day', label: 'Rate / Day', type: 'currency' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    filters: [
      {
        key: 'status', label: 'Status', options: [
          { value: '', label: 'All Status' },
          { value: 'available', label: 'Available' },
          { value: 'on_rent', label: 'On Rent' },
          { value: 'maintenance', label: 'Maintenance' },
          { value: 'inactive', label: 'Inactive' }
        ]
      },
      {
        key: 'car_type', label: 'Vehicle Type', options: [
          { value: '', label: 'All Types' },
          { value: 'Sedan', label: 'Sedan' },
          { value: 'SUV', label: 'SUV' },
          { value: 'APV', label: 'APV' },
          { value: 'Hatchback', label: 'Hatchback' },
          { value: 'Luxury', label: 'Luxury' }
        ]
      },
      {
        key: 'fuel_type', label: 'Fuel Type', options: [
          { value: '', label: 'All Fuels' },
          { value: 'Petrol', label: 'Petrol' },
          { value: 'Diesel', label: 'Diesel' },
          { value: 'Hybrid', label: 'Hybrid' },
          { value: 'Electric', label: 'Electric' }
        ]
      }
    ],
  },

  owners: {
    title: 'Owners',
    endpoint: '/owners',
    tabs: [
      { key: 'list', label: 'List' },
      { key: 'form', label: 'Form' },
      { key: 'documents', label: 'Documents' },
    ],
    fields: [
      { name: 'owner_name', label: 'Owner Name', required: true, type: 'text' },
      { name: 'father_name', label: 'Father Name', type: 'text' },
      { name: 'cnic_no', label: 'CNIC Number', type: 'text', maxLength: 14 },
      { name: 'phone_no', label: 'Phone Number', required: true, type: 'number' },
      { name: 'alternate_phone', label: 'Alternate Phone', type: 'tel' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'city', label: 'City', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'], defaultValue: 'active' },
    ],
    columns: [
      { key: 'owner_name', label: 'Owner Name' },
      { key: 'phone_no', label: 'Phone' },
      { key: 'cnic_no', label: 'CNIC' },
      { key: 'city', label: 'City' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    filters: [
      {
        key: 'status', label: 'Status', options: [
          { value: '', label: 'All Status' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }
        ]
      }
    ],
  },

  setup: {
    title: 'Setup Modules',
    endpoint: '/setup',
    isMultiType: true,
    setupTypes: [
      { key: 'vehicle-type', label: 'Vehicle Types', endpoint: '/vehicle-types' },
      { key: 'maintenance-type', label: 'Maintenance Types', endpoint: '/maintenance-types' },
      { key: 'rent-type', label: 'Rent Types', endpoint: '/rent-types' },
      { key: 'accessory-type', label: 'Accessory Types', endpoint: '/accessory-types' }
    ],
    tabs: [
      { key: 'vehicle-type', label: 'Vehicle Types' },
      { key: 'maintenance-type', label: 'Maintenance Types' },
      { key: 'rent-type', label: 'Rent Types' },
      { key: 'accessory-type', label: 'Accessory Types' }
    ]
  },


  bookings: {
    title: 'Booking Management',
    endpoint: '/bookings',
    tabs: [
      { key: 'list', label: 'List' },
      { key: 'form', label: 'Form' },
      { key: 'calendar', label: 'Calendar' },
      { key: 'history', label: 'History' },
    ],
    fields: [
      { name: 'customer_id', label: 'Customer', required: true, type: 'select' },
      { name: 'vehicle_id', label: 'Vehicle', required: true, type: 'select' },
      { name: 'date_from', label: 'Start Date', type: 'date', required: true },
      { name: 'date_to', label: 'End Date', type: 'date', required: true },
      { name: 'pickup_city', label: 'Pickup City', required: true },
      { name: 'dropoff_city', label: 'Dropoff City', required: true },
      { name: 'advance_amount', label: 'Advance Amount', type: 'number' },
      { name: 'security_deposit', label: 'Security Deposit', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'], defaultValue: 'pending' },
      { name: 'payment_status', label: 'Payment Status', type: 'select', options: ['unpaid', 'partial', 'paid'], defaultValue: 'unpaid' },
    ],
    columns: [
      { key: 'booking_code', label: 'Booking Code' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'vehicle_info', label: 'Vehicle' },
      { key: 'date_from', label: 'Start', type: 'date' },
      { key: 'date_to', label: 'End', type: 'date' },
      { key: 'total_days', label: 'Days' },
      { key: 'total_amount', label: 'Total', type: 'currency' },
      { key: 'payment_status', label: 'Payment', type: 'status' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    filters: [
      { key: 'status', label: 'Status', options: ['', 'pending', 'confirmed', 'ongoing', 'completed', 'cancelled'] },
      { key: 'payment_status', label: 'Payment', options: ['', 'unpaid', 'partial', 'paid'] }
    ],
  },


  return: {
    title: 'Vehicle Return',
    endpoint: '/return',
    tabs: [
      { key: 'list', label: 'List' },
      { key: 'form', label: 'Form' },
    ],
    fields: [
      { name: 'booking_id', label: 'Booking', required: true, type: 'select' },
      { name: 'return_date', label: 'Return Date', type: 'datetime-local', required: true },
      { name: 'odometer_in', label: 'Odometer In', type: 'number', required: true },
      { name: 'fuel_level_in', label: 'Fuel Level', required: true },
      { name: 'extra_charges', label: 'Extra Charges', type: 'number' },
      { name: 'damage_charges', label: 'Damage Charges', type: 'number' },
      { name: 'damage_notes', label: 'Damage Notes', type: 'textarea' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
      { name: 'returned_by', label: 'Returned By' },
    ],
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'booking_id', label: 'Booking ID' },
      { key: 'return_date', label: 'Return Date', type: 'date' },
      { key: 'odometer_in', label: 'Odometer' },
      { key: 'fuel_level_in', label: 'Fuel' },
      { key: 'final_amount', label: 'Final Amount', type: 'currency' },
      { key: 'balance_amount', label: 'Balance', type: 'currency' },
    ],
    filters: [
      { key: 'booking_id', label: 'Booking ID', options: [''] }, // Add options array
      { key: 'status', label: 'Status', options: ['', 'completed'] }
    ],
  },

  handover: {
    title: 'Vehicle Handover',
    endpoint: '/handover',
    tabs: [
      { key: 'list', label: 'List' },
      { key: 'form', label: 'Form' },
    ],
    fields: [
      { name: 'booking_id', label: 'Booking', required: true, type: 'select' },
      { name: 'vehicle_id', label: 'Vehicle', required: true, type: 'select' },
      { name: 'handed_over_by', label: 'Handed Over By', required: true },
      { name: 'handover_datetime', label: 'Handover Date', type: 'datetime-local' },
      { name: 'km_out', label: 'Odometer Out', type: 'number', required: true },
      { name: 'fuel_level_out', label: 'Fuel Level', required: true },
      { name: 'vehicle_out_notes', label: 'Notes', type: 'textarea' },
    ],
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'booking_id', label: 'Booking ID' },
      { key: 'car_make', label: 'Make' },
      { key: 'car_model', label: 'Model' },
      { key: 'handover_datetime', label: 'Date', type: 'date' },
      { key: 'km_out', label: 'Odometer' },
      { key: 'fuel_level_out', label: 'Fuel' },
      { key: 'handed_over_by', label: 'Handed By' },
    ],
    filters: [
      { key: 'status', label: 'Status', options: ['', 'ongoing', 'completed'] }
    ],
  },

  payments: {
    title: 'Payments',
    endpoint: '/payments',
    tabs: [
      { key: 'history', label: 'Payment History' },
      { key: 'form', label: 'Add Payment' },
    ],
    fields: [
      { name: 'booking_id', label: 'Booking ID', required: true },
      { name: 'payment_type', label: 'Payment Type', type: 'select', required: true, options: ['advance', 'balance', 'security_deposit_received', 'security_deposit_refunded', 'extra_charges', 'full_payment'] },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'payment_method', label: 'Payment Method', type: 'select', options: ['cash', 'bank', 'easypaisa', 'jazzcash'] },
      { name: 'payment_date', label: 'Payment Date', type: 'date', required: true },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    columns: [
      { key: 'receipt_no', label: 'Receipt No' },
      { key: 'booking_id', label: 'Booking ID' },
      { key: 'payment_type', label: 'Type' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'payment_method', label: 'Method' },
      { key: 'payment_date', label: 'Date', type: 'date' },
    ],
  },

  'cash-receipts': {
    title: 'Cash Receipts',
    endpoint: '/receipts',
    tabs: [
      { key: 'list', label: 'List' },
      { key: 'form', label: 'Add Receipt' },
    ],
    fields: [
      { name: 'customer_id', label: 'Customer', type: 'select', required: false, hidden: true },
      { name: 'received_from', label: 'Received From', required: true },
      { name: 'source', label: 'Receipt Type', type: 'select', options: ['booking', 'general'], required: true },
      { name: 'reference_id', label: 'Booking ID', type: 'number', required: false, hidden: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'payment_method', label: 'Payment Method', type: 'select', options: ['cash', 'bank', 'easypaisa', 'jazzcash'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    columns: [
      { key: 'created_at', label: 'Date', type: 'date' },
      { key: 'received_from', label: 'Received From' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'payment_method', label: 'Method' },
      { key: 'source', label: 'Type' },
    ],
    filters: [
      { key: 'source', label: 'Receipt Type', options: ['booking', 'general'] },
      { key: 'payment_method', label: 'Payment Method', options: ['cash', 'bank', 'easypaisa', 'jazzcash'] },
    ]
  },

  expenses: {
    title: 'Expenses',
    endpoint: '/expenses',
    tabs: [
      { key: 'list', label: 'List' },
      { key: 'form', label: 'Form' },
      { key: 'report', label: 'Report' },
    ],
    fields: [
      { name: 'expense_date', label: 'Expense Date', type: 'date', required: true },
      { name: 'expense_head', label: 'Expense Head', required: true },
      { name: 'vendor_name', label: 'Vendor Name' },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'payment_method', label: 'Payment Method', type: 'select', options: ['cash', 'bank', 'easypaisa', 'jazzcash'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    columns: [
      { key: 'expense_date', label: 'Date', type: 'date' },
      { key: 'expense_head', label: 'Head' },
      { key: 'vendor_name', label: 'Vendor' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'payment_method', label: 'Method' },
    ],
  },


  maintenance: {
    title: 'Vehicle Maintenance',
    endpoint: '/maintenance',
    tabs: [
      { key: 'list', label: 'List' },
      { key: 'form', label: 'Form' },
      { key: 'due', label: 'Due Maintenance' },
    ],
    fields: [
      { name: 'vehicle_id', label: 'Vehicle ID', required: true },
      { name: 'maintenance_type_id', label: 'Maintenance Type ID', required: true },
      { name: 'service_date', label: 'Service Date', type: 'date', required: true },
      { name: 'odometer_km', label: 'Odometer KM', type: 'number' },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'vendor_name', label: 'Vendor Name' },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'completed', 'overdue'], defaultValue: 'pending' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    columns: [
      { key: 'vehicle_id', label: 'Vehicle ID' },
      { key: 'maintenance_type_id', label: 'Type ID' },
      { key: 'service_date', label: 'Service Date', type: 'date' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    filters: [{ key: 'status', label: 'Status', options: ['', 'pending', 'completed', 'overdue'] }],
  },

  'owner-earnings': {
    title: 'Owner Earnings',
    endpoint: '/owner-earnings',
    tabs: [
      // { key: 'list', label: 'All Earnings' },
      // { key: 'summary', label: 'Summary' },
      // { key: 'due', label: 'Due Payments' },
    ],
    fields: [], // No form fields as earnings are auto-generated from bookings
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'owner_name', label: 'Owner' },
      { key: 'registration_no', label: 'Vehicle Reg' },
      { key: 'booking_code', label: 'Booking Code' },
      { key: 'booking_amount', label: 'Booking Amount', type: 'currency' },
      { key: 'owner_percentage', label: 'Owner %', type: 'percentage' },
      { key: 'owner_amount', label: 'Owner Amount', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
  },


  reports: {
    title: 'Reports',
    endpoint: '/reports/profit-loss',
    tabs: [
      { key: 'profit-loss', label: 'Profit & Loss' },
      { key: 'daybook', label: 'Daybook' },
      { key: 'expense', label: 'Expense Report' },
      { key: 'receipt', label: 'Receipt Report' },
    ],
    fields: [],
    columns: [],
    reportTypes: {  // Add this property
      'profit-loss': { endpoint: '/reports/profit-loss', method: 'GET' },
      'daybook': { endpoint: '/reports/daybook', method: 'GET' },
      'expense': { endpoint: '/reports/expense', method: 'GET' },
      'receipt': { endpoint: '/reports/receipt', method: 'GET' },
    },
  },

  daybook: {
    title: 'Daybook',
    endpoint: '/daybook',
    tabs: [
      { key: 'list', label: 'List' },
    ],
    fields: [],
    columns: [
      { key: 'entry_date', label: 'Date', type: 'date' },
      { key: 'entry_type', label: 'Type' },
      { key: 'reference', label: 'Reference' },
      { key: 'debit', label: 'Debit', type: 'currency' },
      { key: 'credit', label: 'Credit', type: 'currency' },
      { key: 'balance', label: 'Balance', type: 'currency' },
    ],
  },
};

export const defaultReportData = [
  { name: 'Mon', income: 150000, expense: 50000 },
  { name: 'Tue', income: 180000, expense: 65000 },
  { name: 'Wed', income: 110000, expense: 40000 },
  { name: 'Thu', income: 200000, expense: 80000 },
  { name: 'Fri', income: 230000, expense: 70000 },
  { name: 'Sat', income: 175000, expense: 55000 },
];

export const pieReportData = [
  { name: 'Cash', value: 48 },
  { name: 'Bank', value: 22 },
  { name: 'EasyPaisa', value: 18 },
  { name: 'JazzCash', value: 12 },
];

export const timelineSeed = [
  { title: 'Booking created', description: 'Customer booking record generated with advance details.', date: '2026-04-01 10:30 AM' },
  { title: 'Payment received', description: 'Advance payment posted in receipt ledger.', date: '2026-04-01 11:00 AM' },
  { title: 'Vehicle handed over', description: 'Vehicle marked on_rent with odometer captured.', date: '2026-04-02 09:00 AM' },
  { title: 'Return pending', description: 'Expected return reminder shown for operations team.', date: '2026-04-03 06:00 PM' },
];

export const dashboardSummaryCards = [
  { label: 'Total Bookings', value: '1,248', change: '+12.4%' },
  { label: 'Active Vehicles', value: '86', change: '+4.1%' },
  { label: 'Today Cash In', value: 'PKR 430K', change: '+8.2%' },
  { label: 'Pending Returns', value: '11', change: '-2.3%' },
];


// Individual setup type configurations
export const setupTypeConfigs = {
  'vehicle-type': {
    title: 'Vehicle Types',
    endpoint: '/vehicle-types',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'], defaultValue: 'active' }
    ]
  },
  'maintenance-type': {
    title: 'Maintenance Types',
    endpoint: '/maintenance-types',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'], defaultValue: 'active' }
    ]
  },
  'rent-type': {
    title: 'Rent Types',
    endpoint: '/rent-types',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'], defaultValue: 'active' }
    ]
  },
  'accessory-type': {
    title: 'Accessory Types',
    endpoint: '/accessory-types',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'], defaultValue: 'active' }
    ]
  }
};

