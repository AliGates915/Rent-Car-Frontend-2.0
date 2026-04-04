export const classNames = (...classes) => classes.filter(Boolean).join(' ');

export const formatCurrency = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(number);
};

export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const titleCase = (value = '') =>
  value
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const buildInitialValues = (fields = []) =>
  fields.reduce((acc, field) => {
    acc[field.name] = field.defaultValue ?? (field.type === 'checkbox' ? false : '');
    return acc;
  }, {});

export const validateForm = (fields = [], values = {}) => {
  const errors = {};

  fields.forEach((field) => {
    const value = values[field.name];
    if (field.required && (value === '' || value === null || value === undefined)) {
      errors[field.name] = `${field.label} is required`;
    }
    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[field.name] = 'Enter a valid email address';
    }
    if (field.validator) {
      const customError = field.validator(value, values);
      if (customError) errors[field.name] = customError;
    }
  });

  return errors;
};
