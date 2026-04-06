// frontend/src/components/Setup/SetupForm.jsx
import React, { useState, useEffect } from 'react';
import { useSetup } from '../../contexts/SetupContext';

const SetupForm = () => {
  const { 
    selectedItem, 
    formMode, 
    config, 
    moduleType,
    createItem, 
    updateItem, 
    resetForm,
    fetchItems 
  } = useSetup();

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setFormData(selectedItem);
    } else {
      // Initialize with default values
      const initialData = {};
      config.fields.forEach(field => {
        initialData[field.name] = field.defaultValue || '';
      });
      initialData.module_type = moduleType;
      setFormData(initialData);
    }
  }, [selectedItem, config.fields, moduleType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
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
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (formMode === 'create') {
        const result = await createItem(formData);
        if (result.success) {
          resetForm();
          await fetchItems();
        }
      } else {
        const result = await updateItem(selectedItem.id, formData);
        if (result.success) {
          resetForm();
          await fetchItems();
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        );
      case 'select':
        return (
          <select
            id={field.name}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select {field.label}</option>
            {field.options.map(option => (
              <option key={option} value={option}>
                {option.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            id={field.name}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">
        {formMode === 'create' ? 'Create New Record' : 'Edit Record'}
      </h3>
      
      {config.fields.map(field => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {renderField(field)}
          {errors[field.name] && (
            <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
          )}
        </div>
      ))}
      
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : formMode === 'create' ? 'Create' : 'Update'}
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default SetupForm;