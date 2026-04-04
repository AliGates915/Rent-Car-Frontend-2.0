import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import FormCard from './ui/FormCard';
import { buildInitialValues, validateForm } from '../utils/helpers';
import { moduleApi } from '../services/api';

function Field({ field, value, onChange, error }) {
  const commonClass = `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${
    error ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50 focus:border-primary-500 focus:bg-white'
  }`;

  if (field.type === 'textarea') {
    return <textarea rows={4} className={commonClass} value={value} onChange={(e) => onChange(field.name, e.target.value)} />;
  }

  if (field.type === 'select') {
    const options = Array.isArray(field.options)
      ? field.options.map((option) => (typeof option === 'string' ? { label: option, value: option } : option))
      : [];

    return (
      <select className={commonClass} value={value} onChange={(e) => onChange(field.name, e.target.value)}>
        <option value="">Select {field.label}</option>
        {options.map((option) => (
          <option key={String(option.value)} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <label className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(field.name, e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
        <span>{field.label}</span>
      </label>
    );
  }

  return <input type={field.type || 'text'} className={commonClass} value={value} onChange={(e) => onChange(field.name, e.target.value)} />;
}

export default function GenericForm({ config, editingRecord, onSuccess, onCancelEdit }) {
  const initialValues = useMemo(() => buildInitialValues(config.fields), [config.fields]);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingRecord) {
      setValues({ ...initialValues, ...editingRecord });
    } else {
      setValues(initialValues);
    }
  }, [editingRecord, initialValues]);

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleReset = () => {
    setValues(initialValues);
    setErrors({});
    onCancelEdit?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(config.fields, values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setSubmitting(true);
    try {
      if (editingRecord?.id) {
        await moduleApi.update(config.endpoint, editingRecord.id, values);
        toast.success(`${config.title} updated successfully`);
      } else {
        await moduleApi.create(config.endpoint, values);
        toast.success(`${config.title} created successfully`);
      }
      setValues(initialValues);
      onSuccess?.();
    } catch {
      // handled in interceptor
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormCard
      title={editingRecord ? `Edit ${config.title}` : `Create ${config.title}`}
      description="All forms are inline. Submit saves the record and returns you to the list tab automatically."
    >
      {config.fields.length ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {config.fields.map((field) => (
              <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                {field.type !== 'checkbox' ? (
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {field.label}
                    {field.required ? <span className="ml-1 text-rose-500">*</span> : null}
                  </label>
                ) : null}
                <Field field={field} value={values[field.name]} onChange={handleChange} error={errors[field.name]} />
                {errors[field.name] ? <p className="mt-1 text-xs text-rose-600">{errors[field.name]}</p> : null}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Saving...' : editingRecord ? 'Update Record' : 'Submit Record'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500">
          This module does not need a form tab. Use summary and list tabs for operational review.
        </div>
      )}
    </FormCard>
  );
}
