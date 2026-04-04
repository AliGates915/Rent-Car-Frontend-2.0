// components/owners/OwnerForm.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import { moduleApi } from '../../services/api';

export default function OwnerForm({ config, editingRecord, onSuccess, onCancelEdit }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [documents, setDocuments] = useState({
    cnic_front: null,
    cnic_back: null,
    driving_license_front: null,
    driving_license_back: null
  });

  useEffect(() => {
    const initialData = {};
    config.fields.forEach(field => {
      if (editingRecord && editingRecord[field.name] !== undefined) {
        initialData[field.name] = editingRecord[field.name];
      } else if (field.defaultValue !== undefined) {
        initialData[field.name] = field.defaultValue;
      } else {
        initialData[field.name] = '';
      }
    });
    setFormData(initialData);

    // Set existing documents if editing
    if (editingRecord) {
      setDocuments({
        cnic_front: editingRecord.cnic_front_url,
        cnic_back: editingRecord.cnic_back_url,
        driving_license_front: editingRecord.driving_license_front_url,
        driving_license_back: editingRecord.driving_license_back_url
      });
    }
  }, [editingRecord, config.fields]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (docType, file) => {
    if (file) {
      setDocuments(prev => ({ ...prev, [docType]: file }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    config.fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const submitData = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add documents
      if (documents.cnic_front instanceof File) submitData.append('cnic_front', documents.cnic_front);
      if (documents.cnic_back instanceof File) submitData.append('cnic_back', documents.cnic_back);
      if (documents.driving_license_front instanceof File) submitData.append('driving_license_front', documents.driving_license_front);
      if (documents.driving_license_back instanceof File) submitData.append('driving_license_back', documents.driving_license_back);
      
      let response;
      if (editingRecord) {
        response = await moduleApi.update(config.endpoint, editingRecord.id, submitData);
        toast.success('Owner updated successfully');
      } else {
        response = await moduleApi.create(config.endpoint, submitData);
        toast.success('Owner created successfully');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to save owner');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const value = formData[field.name] || '';
    
    switch (field.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`w-full rounded-xl border ${errors[field.name] ? 'border-red-500' : 'border-slate-200'} bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500`}
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            rows="3"
            className={`w-full rounded-xl border ${errors[field.name] ? 'border-red-500' : 'border-slate-200'} bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500`}
            placeholder={field.label}
            required={field.required}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`w-full rounded-xl border ${errors[field.name] ? 'border-red-500' : 'border-slate-200'} bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500`}
            placeholder={field.label}
            required={field.required}
            step="0.01"
          />
        );
      
      default:
        return (
          <input
            type={field.type || 'text'}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`w-full rounded-xl border ${errors[field.name] ? 'border-red-500' : 'border-slate-200'} bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500`}
            placeholder={field.label}
            required={field.required}
          />
        );
    }
  };

  const DocumentUploadField = ({ label, docKey, accept = "image/*" }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {documents[docKey] instanceof File ? (
        <div className="relative">
          <img src={URL.createObjectURL(documents[docKey])} alt={label} className="h-24 object-cover rounded-lg" />
          <button
            type="button"
            onClick={() => handleFileChange(docKey, null)}
            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
          >
            <X size={14} />
          </button>
        </div>
      ) : documents[docKey] && typeof documents[docKey] === 'string' ? (
        <div className="relative">
          <img src={documents[docKey]} alt={label} className="h-24 object-cover rounded-lg" />
          <label className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center cursor-pointer">
            <Upload size={20} className="text-white" />
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={(e) => handleFileChange(docKey, e.target.files[0])}
            />
          </label>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary-500">
          <Upload size={20} className="text-slate-400 mb-1" />
          <span className="text-xs text-slate-500">Upload {label}</span>
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={(e) => handleFileChange(docKey, e.target.files[0])}
          />
        </label>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {editingRecord ? `Edit ${config.title.slice(0, -1)}` : `Add New ${config.title.slice(0, -1)}`}
          </h2>
          <p className="text-sm text-slate-500 mt-1">Fill in the owner details and upload documents</p>
        </div>

        <div className="p-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {config.fields.map(field => (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                {errors[field.name] && <p className="text-xs text-red-500">{errors[field.name]}</p>}
              </div>
            ))}
          </div>

          {/* Documents Section */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-md font-semibold text-slate-900 mb-4">Owner Documents</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <DocumentUploadField label="CNIC Front" docKey="cnic_front" />
              <DocumentUploadField label="CNIC Back" docKey="cnic_back" />
              <DocumentUploadField label="License Front" docKey="driving_license_front" />
              <DocumentUploadField label="License Back" docKey="driving_license_back" />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button type="button" onClick={onCancelEdit} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
            {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> Saving...</> : <><Save size={16} /> {editingRecord ? 'Update Owner' : 'Create Owner'}</>}
          </button>
        </div>
      </div>
    </form>
  );
}