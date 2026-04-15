// frontend/src/components/cash-receipts/CashReceiptsListView.jsx
import { useState } from 'react';
import { Eye, Edit, Trash2, Download, Printer } from 'lucide-react';
import DataTable from '../ui/DataTable';
import Modal from '../ui/Modal';

export default function CashReceiptsListView({
  receipts,
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
  onPageChange,
  onViewReceipt
}) {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setIsViewModalOpen(true);
    onViewReceipt?.(receipt);
  };

  // Get customer name or source description
  const getReceivedFrom = (receipt) => {
    if (receipt.customer_name) {
      return receipt.customer_name;
    }
    if (receipt.source === 'booking' && receipt.reference_id) {
      return `Booking #${receipt.reference_id}`;
    }
    return receipt.source || 'General';
  };

  // Get receipt head/type
  const getHead = (receipt) => {
    if (receipt.source === 'booking') return 'Booking Payment';
    if (receipt.customer_id) return 'Customer Payment';
    return 'General Receipt';
  };

  // Custom columns with actual table fields
  const columns = [
    {
      key: 'created_at',
      label: 'Date',
      type: 'date',
      render: (row) => (
        <span>{new Date(row.created_at).toLocaleDateString()}</span>
      )
    },
    {
      key: 'received_from',
      label: 'Received From',
      render: (row) => getReceivedFrom(row)
    },
    {
      key: 'head',
      label: 'Head',
      render: (row) => getHead(row)
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'currency',
      render: (row) => (
        <span className="font-semibold text-green-600">
          ₨ {parseFloat(row.amount).toLocaleString()}
        </span>
      )
    },
    {
      key: 'payment_method',
      label: 'Method',
      render: (row) => {
        const methodColors = {
          cash: 'bg-green-100 text-green-800',
          bank: 'bg-blue-100 text-blue-800',
          easypaisa: 'bg-orange-100 text-orange-800',
          jazzcash: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${methodColors[row.payment_method] || 'bg-gray-100 text-gray-800'}`}>
            {row.payment_method?.toUpperCase() || '-'}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewReceipt(row)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View Receipt"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onEdit(row)}
            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(row)}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  // Calculate summary statistics
  const totalAmount = receipts?.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0) || 0;
  const cashAmount = receipts?.filter(r => r.payment_method === 'cash').reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0) || 0;
  const bankAmount = receipts?.filter(r => r.payment_method === 'bank').reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0) || 0;
  const mobileAmount = receipts?.filter(r => r.payment_method === 'easypaisa' || r.payment_method === 'jazzcash')
    .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0) || 0;

  return (
    <>
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Receipts</p>
            <p className="text-2xl font-bold text-gray-900">
              {receipts?.length || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-green-600">
              ₨ {totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Cash Payments</p>
            <p className="text-2xl font-bold text-blue-600">
              ₨ {cashAmount.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Bank/Mobile</p>
            <p className="text-2xl font-bold text-purple-600">
              ₨ {bankAmount.toLocaleString()}
              <span className="text-sm font-normal text-gray-500 ml-1">
                (+₨ {mobileAmount.toLocaleString()} mobile)
              </span>
            </p>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          title="Cash Receipts List"
          description="View and manage all cash receipts"
          columns={columns}
          data={receipts}
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
          additionalButtons={
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Printer size={16} />
                Print Report
              </button>
              <button
                onClick={() => {
                  // Export to CSV logic
                  const csvData = receipts?.map(r => ({
                    Date: new Date(r.created_at).toLocaleDateString(),
                    'Received From': getReceivedFrom(r),
                    Head: getHead(r),
                    Amount: r.amount,
                    'Payment Method': r.payment_method,
                    'Reference ID': r.reference_id || '',
                    'Customer ID': r.customer_id || '',
                    Notes: r.notes || ''
                  })) || [];
                  const csv = convertToCSV(csvData);
                  downloadCSV(csv, `cash-receipts-${new Date().toISOString().split('T')[0]}.csv`);
                }}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          }
        />
      </div>

      {/* View Receipt Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Receipt Details"
      >
        {selectedReceipt && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p className="mt-1 text-gray-900">
                  {new Date(selectedReceipt.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Received From</label>
                <p className="mt-1 text-gray-900">{getReceivedFrom(selectedReceipt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Head</label>
                <p className="mt-1 text-gray-900 capitalize">{getHead(selectedReceipt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Amount</label>
                <p className="mt-1 text-xl font-bold text-green-600">
                  ₨ {parseFloat(selectedReceipt.amount).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Payment Method</label>
                <p className="mt-1 text-gray-900 capitalize">{selectedReceipt.payment_method || '-'}</p>
              </div>
              {selectedReceipt.reference_id && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Reference ID</label>
                  <p className="mt-1 text-gray-900">{selectedReceipt.reference_id}</p>
                </div>
              )}
              {selectedReceipt.customer_id && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer ID</label>
                  <p className="mt-1 text-gray-900">{selectedReceipt.customer_id}</p>
                </div>
              )}
              {selectedReceipt.source && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Source</label>
                  <p className="mt-1 text-gray-900 capitalize">{selectedReceipt.source}</p>
                </div>
              )}
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <p className="mt-1 text-gray-900">{selectedReceipt.notes || 'No notes provided'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  onEdit(selectedReceipt);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Edit Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

// Helper functions for CSV export
function convertToCSV(data) {
  if (!data.length) return '';
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
  ];
  return csvRows.join('\n');
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}