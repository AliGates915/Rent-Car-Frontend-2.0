// components/vehicles/VehicleDocumentsForm.jsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Upload, Save } from 'lucide-react';
import { moduleApi } from '../../../services/api';

const DOCUMENT_TYPES = [
  { value: 'registration_book', label: 'Registration Book' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'fitness', label: 'Fitness Certificate' },
  { value: 'pollution', label: 'Pollution Certificate' },
  { value: 'tax_token', label: 'Tax Token' },
];

export default function VehicleDocumentsForm({ vehicleId, vehicleRegNo, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    document_type: '',
    document_number: '',
    issue_date: '',
    expiry_date: '',
    notes: ''
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.document_type) {
      toast.error('Please select document type');
      return;
    }

    setLoading(true);
    
    try {
      const submitData = new FormData();
      submitData.append('vehicle_id', vehicleId);
      submitData.append('document_type', formData.document_type);
      submitData.append('document_number', formData.document_number);
      submitData.append('issue_date', formData.issue_date);
      submitData.append('expiry_date', formData.expiry_date);
      submitData.append('notes', formData.notes);
      if (file) submitData.append('document', file);

      await moduleApi.create('/vehicles/documents', submitData);
      toast.success('Document uploaded successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        Upload Documents for {vehicleRegNo}
      </h3>
      <p className="text-sm text-slate-500 mb-6">Fill in the document details below</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Document Type *
            </label>
            <select
              name="document_type"
              value={formData.document_type}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              required
            >
              <option value="">Select Document Type</option>
              {DOCUMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Document Number */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Document Number
            </label>
            <input
              type="text"
              name="document_number"
              value={formData.document_number}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="e.g., ABC-123"
            />
          </div>

          {/* Issue Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Issue Date
            </label>
            <input
              type="date"
              name="issue_date"
              value={formData.issue_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Additional notes about this document..."
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Document File *
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-4">
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded" />
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block text-center">
                <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                <p className="text-sm text-slate-600">Click to upload document</p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </label>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? 'Uploading...' : 'Save Document'}
          </button>
        </div>
      </form>
    </div>
  );
}