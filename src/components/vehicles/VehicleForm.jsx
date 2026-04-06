// components/vehicles/VehicleForm.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { moduleApi } from '../../services/api';
import useFetch from '../../hooks/useFetch';

export default function VehicleForm({ config, editingRecord, onSuccess, onCancelEdit }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [imagesToDelete, setImagesToDelete] = useState([]);
  
  // Fetch owners for the dropdown
  const { data: owners, loading: ownersLoading } = useFetch('/owners');
  
  // Fetch vehicle types, transmission types, fuel types
  const { data: vehicleTypes } = useFetch('/vehicle-types');
  const { data: transmissionTypes } = useFetch('/maintenance-types?search=transmission');
  const { data: fuelTypes } = useFetch('/maintenance-types?search=fuel');

  // Initialize form with default values or editing record
  useEffect(() => {
    const initialData = {
      owner_id: '',
      registration_no: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      vehicle_type_id: '',
      rate_per_day: 0,
      transmission: '',
      fuel_type: '',
      location: '',
      air_conditioner: true,
      android_panel: false,
      sun_roof: false,
      front_camera: false,
      rear_camera: false,
      status: 'available'
    };
    
    if (editingRecord) {
      Object.keys(initialData).forEach(key => {
        if (editingRecord[key] !== undefined) {
          initialData[key] = editingRecord[key];
        }
      });
    }
    
    setFormData(initialData);

    // Set existing images if editing
    if (editingRecord && editingRecord.images && editingRecord.images.length > 0) {
      const existingImages = editingRecord.images.map((img, idx) => ({
        url: img.url,
        isExisting: true,
        public_id: img.public_id,
        id: idx
      }));
      setImagePreviews(existingImages);
    } else {
      setImagePreviews([]);
    }
    
    setImages([]);
    setImagesToDelete([]);
  }, [editingRecord]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = imagePreviews.filter(p => p.isExisting).length + images.length + files.length;
    
    if (totalImages > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const validFiles = [];
    
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image`);
      } else if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
      } else {
        validFiles.push(file);
      }
    });

    setImages(prev => [...prev, ...validFiles]);
    
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
    
    if (preview.url && !preview.isExisting) {
      URL.revokeObjectURL(preview.url);
    }
    
    if (preview.isExisting && preview.public_id) {
      setImagesToDelete(prev => [...prev, preview.public_id]);
    }
    
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
    const requiredFields = ['owner_id', 'registration_no', 'make', 'model', 'year', 'vehicle_type_id', 'transmission', 'fuel_type'];
    const newErrors = {};
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        const labels = {
          owner_id: 'Owner',
          registration_no: 'Registration No',
          make: 'Make',
          model: 'Model',
          year: 'Year',
          vehicle_type_id: 'Vehicle Type',
          transmission: 'Transmission',
          fuel_type: 'Fuel Type'
        };
        newErrors[field] = `${labels[field]} is required`;
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
      
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value === 'boolean') {
            submitData.append(key, value ? 1 : 0);
          } else {
            submitData.append(key, value);
          }
        }
      });
      
      images.forEach(image => {
        submitData.append('images', image);
      });
      
      if (imagesToDelete.length > 0) {
        submitData.append('deleteImages', JSON.stringify(imagesToDelete));
      }
      
      if (editingRecord) {
        await moduleApi.update('/vehicles', editingRecord.id, submitData);
        toast.success('Vehicle updated successfully');
      } else {
        await moduleApi.create('/vehicles', submitData);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {editingRecord ? 'Edit Vehicle Management' : 'Add New Vehicle Management'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Fill in the vehicle details below
          </p>
        </div>

        <div className="p-6">
          {/* Two Column Grid for Basic Info */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Owner Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Owner <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.owner_id || ""}
                onChange={(e) => handleChange('owner_id', e.target.value)}
                className={`w-full rounded-xl border ${errors.owner_id ? 'border-red-500' : 'border-slate-200'} bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
                disabled={ownersLoading}
              >
                <option value="">Select Owner</option>
                {owners?.map(owner => (
                  <option key={owner.id} value={owner.id}>
                    {owner.owner_name || owner.name} - {owner.cnic_no || owner.phone_no || `ID: ${owner.id}`}
                  </option>
                ))}
              </select>
              {errors.owner_id && <p className="text-xs text-red-500">{errors.owner_id}</p>}
            </div>

            {/* Registration No */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Registration No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.registration_no}
                onChange={(e) => handleChange('registration_no', e.target.value)}
                className={`w-full rounded-xl border ${errors.registration_no ? 'border-red-500' : 'border-slate-200'} bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
                placeholder="ABC-123"
              />
              {errors.registration_no && <p className="text-xs text-red-500">{errors.registration_no}</p>}
            </div>

            {/* Make */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Make <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.make}
                onChange={(e) => handleChange('make', e.target.value)}
                className={`w-full rounded-xl border ${errors.make ? 'border-red-500' : 'border-slate-200'} bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
                placeholder="Toyota"
              />
              {errors.make && <p className="text-xs text-red-500">{errors.make}</p>}
            </div>

            {/* Model */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                className={`w-full rounded-xl border ${errors.model ? 'border-red-500' : 'border-slate-200'} bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
                placeholder="Corolla"
              />
              {errors.model && <p className="text-xs text-red-500">{errors.model}</p>}
            </div>

            {/* Year */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => handleChange('year', parseInt(e.target.value))}
                className={`w-full rounded-xl border ${errors.year ? 'border-red-500' : 'border-slate-200'} bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
                placeholder="2024"
                min="1990"
                max="2026"
              />
              {errors.year && <p className="text-xs text-red-500">{errors.year}</p>}
            </div>

            {/* Vehicle Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Vehicle Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.vehicle_type_id || ""}
                onChange={(e) => handleChange('vehicle_type_id', e.target.value)}
                className={`w-full rounded-xl border ${errors.vehicle_type_id ? 'border-red-500' : 'border-slate-200'} bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
              >
                <option value="">Select Vehicle Type</option>
                {vehicleTypes?.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              {errors.vehicle_type_id && <p className="text-xs text-red-500">{errors.vehicle_type_id}</p>}
            </div>

            {/* Rate Per Day */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Rate Per Day
              </label>
              <input
                type="number"
                value={formData.rate_per_day}
                onChange={(e) => handleChange('rate_per_day', parseFloat(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            {/* Transmission */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Transmission <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.transmission || ""}
                onChange={(e) => handleChange('transmission', e.target.value)}
                className={`w-full rounded-xl border ${errors.transmission ? 'border-red-500' : 'border-slate-200'} bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
              >
                <option value="">Select Transmission</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
              {errors.transmission && <p className="text-xs text-red-500">{errors.transmission}</p>}
            </div>

            {/* Fuel Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Fuel Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.fuel_type || ""}
                onChange={(e) => handleChange('fuel_type', e.target.value)}
                className={`w-full rounded-xl border ${errors.fuel_type ? 'border-red-500' : 'border-slate-200'} bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500`}
              >
                <option value="">Select Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
                <option value="CNG">CNG</option>
              </select>
              {errors.fuel_type && <p className="text-xs text-red-500">{errors.fuel_type}</p>}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500"
                placeholder="City, Area"
              />
            </div>
          </div>

          {/* Features Section - Checkboxes */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-md font-semibold text-slate-900 mb-4">Vehicle Features</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.air_conditioner}
                  onChange={(e) => handleChange('air_conditioner', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">Air Conditioner</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.android_panel}
                  onChange={(e) => handleChange('android_panel', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">Android Panel</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sun_roof}
                  onChange={(e) => handleChange('sun_roof', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">Sun Roof</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.front_camera}
                  onChange={(e) => handleChange('front_camera', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">Front Camera</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rear_camera}
                  onChange={(e) => handleChange('rear_camera', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">Rear Camera</span>
              </label>
            </div>
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