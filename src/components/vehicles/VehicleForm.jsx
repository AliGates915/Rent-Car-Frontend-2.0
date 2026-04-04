// components/vehicles/VehicleForm.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { moduleApi } from '../../services/api';

export default function VehicleForm({ config, editingRecord, onSuccess, onCancelEdit }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Initialize form with default values or editing record
  useEffect(() => {
    const initialData = {};
    config.fields.forEach(field => {
      if (editingRecord && editingRecord[field.name] !== undefined) {
        // Convert checkbox values from 1/0 to boolean
        if (field.type === 'checkbox') {
          initialData[field.name] = editingRecord[field.name] === 1 || editingRecord[field.name] === true;
        } else {
          initialData[field.name] = editingRecord[field.name];
        }
      } else if (field.defaultValue !== undefined) {
        initialData[field.name] = field.defaultValue;
      } else if (field.type === 'checkbox') {
        initialData[field.name] = false;
      } else {
        initialData[field.name] = '';
      }
    });
    setFormData(initialData);

    // Set existing images if editing
    if (editingRecord && editingRecord.images && editingRecord.images.length > 0) {
      const existingImages = editingRecord.images.map((img, idx) => ({
        url: img.url,
        isExisting: true,
        public_id: img.public_id,
        id: idx //临时ID用于显示
      }));
      setImagePreviews(existingImages);
    } else {
      setImagePreviews([]);
    }
    
    // Reset images array when editing record changes
    setImages([]);
    setImagesToDelete([]);
  }, [editingRecord, config.fields]);

  const handleChange = (name, value, type) => {
    // Handle different input types
    let processedValue = value;
    
    if (type === 'number') {
      processedValue = value === '' ? '' : Number(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = imagePreviews.filter(p => p.isExisting).length + images.length + files.length;
    
    // Max 5 images validation
    if (totalImages > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    // Validate each image
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(file.name);
      } else if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(`${invalidFiles.join(', ')} are not valid images`);
    }

    setImages(prev => [...prev, ...validFiles]);
    
    // Create previews
    const newPreviews = validFiles.map((file, idx) => ({
      url: URL.createObjectURL(file),
      isExisting: false,
      file: file,
      id: Date.now() + idx
    }));
    
    setImagePreviews(prev => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeImage = (index) => {
    const preview = imagePreviews[index];
    
    // Revoke object URL to avoid memory leaks
    if (preview.url && !preview.isExisting) {
      URL.revokeObjectURL(preview.url);
    }
    
    // If it's an existing image, mark it for deletion
    if (preview.isExisting && preview.public_id) {
      setImagesToDelete(prev => [...prev, preview.public_id]);
    }
    
    // Remove from images array if it's a new image
    if (!preview.isExisting) {
      const newImageIndex = images.findIndex((_, i) => {
        const previewFile = preview.file;
        return previewFile && images[i] === previewFile;
      });
      if (newImageIndex !== -1) {
        setImages(prev => prev.filter((_, i) => i !== newImageIndex));
      }
    }
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    config.fields.forEach(field => {
      if (field.required) {
        const value = formData[field.name];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          newErrors[field.name] = `${field.label} is required`;
        }
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
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        if (value !== null && value !== undefined && value !== '') {
          // Convert boolean to number for checkboxes
          if (typeof value === 'boolean') {
            submitData.append(key, value ? 1 : 0);
          } else {
            submitData.append(key, value);
          }
        }
      });
      
      // Add new images
      images.forEach(image => {
        submitData.append('images', image);
      });
      
      // Add images to delete
      if (imagesToDelete.length > 0) {
        submitData.append('deleteImages', JSON.stringify(imagesToDelete));
      }
      
      // Log FormData contents for debugging
      console.log('Submitting form data:');
      for (let pair of submitData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      if (editingRecord) {
        await moduleApi.update(config.endpoint, editingRecord.id, submitData);
        toast.success('Vehicle updated successfully');
      } else {
        await moduleApi.create(config.endpoint, submitData);
        toast.success('Vehicle created successfully');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const value = formData[field.name] ?? '';
    
    switch (field.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value, field.type)}
            className={`w-full rounded-xl border ${errors[field.name] ? 'border-red-500' : 'border-slate-200'} bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value === true || value === 1}
              onChange={(e) => handleChange(field.name, e.target.checked, field.type)}
              className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-slate-700">{field.label}</span>
          </label>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value, field.type)}
            className={`w-full rounded-xl border ${errors[field.name] ? 'border-red-500' : 'border-slate-200'} bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
            placeholder={field.label}
            required={field.required}
            min="0"
            step={field.name === 'rate_per_day' ? "0.01" : "1"}
          />
        );
      
      default:
        return (
          <input
            type={field.type || 'text'}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value, field.type)}
            maxLength={field.maxLength}
            className={`w-full rounded-xl border ${errors[field.name] ? 'border-red-500' : 'border-slate-200'} bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
            placeholder={field.label}
            required={field.required}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {editingRecord ? `Edit ${config.title.slice(0, -1)}` : `Add New ${config.title.slice(0, -1)}`}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Fill in the vehicle details below
          </p>
        </div>

        <div className="p-6">
          {/* Two Column Grid for Basic Info */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {config.fields.map(field => (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                {errors[field.name] && (
                  <p className="text-xs text-red-500">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Image Upload Section */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-md font-semibold text-slate-900">Vehicle Images</h3>
                <p className="text-sm text-slate-500">Upload up to 5 images (JPEG, PNG, WEBP)</p>
              </div>
              {imagePreviews.length < 5 && (
                <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700">
                  <Upload size={16} />
                  Upload Images
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Image Grid */}
            {imagePreviews.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {imagePreviews.map((preview, index) => (
                  <div key={preview.id || index} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100">
                      <img
                        src={preview.url}
                        alt={`Vehicle ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                    {preview.isExisting && (
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                        Saved
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <ImageIcon size={48} className="mx-auto text-slate-400 mb-3" />
                <p className="text-slate-500">No images uploaded yet</p>
                <p className="text-sm text-slate-400 mt-1">Click the button above to add images</p>
              </div>
            )}

            {/* Image Count Indicator */}
            {imagePreviews.length > 0 && (
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {imagePreviews.length} of 5 images used
                </span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i < imagePreviews.length
                          ? 'w-4 bg-primary-600'
                          : 'w-1.5 bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
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
                {editingRecord ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{editingRecord ? 'Update Vehicle' : 'Create Vehicle'}</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}