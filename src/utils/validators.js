// src/utils/validators.js
export const isRequired = (value) => {
  if (value === null || value === undefined || value === "") {
    return "This field is required";
  }
  return null;
};

export const isEmail = (value) => {
  if (!value) return null;

  const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!regex.test(value)) {
    return "Invalid email address";
  }
  return null;
};

export const minLength = (length) => (value) => {
  if (!value) return null;

  if (value.length < length) {
    return `Must be at least ${length} characters`;
  }
  return null;
};

export const maxLength = (length) => (value) => {
  if (!value) return null;

  if (value.length > length) {
    return `Must be at most ${length} characters`;
  }
  return null;
};

export const isNumeric = (value) => {
  if (!value) return null;

  if (isNaN(Number(value))) {
    return "Must be a number";
  }
  return null;
};

export const isMatch = (field, fieldLabel) => (value, allValues) => {
  if (!value) return null;

  if (value !== allValues[field]) {
    return `Must match ${fieldLabel}`;
  }
  return null;
};

export const validateForm = (values, validationRules) => {
  const errors = {};

  Object.keys(validationRules).forEach((field) => {
    const fieldRules = validationRules[field];

    for (const rule of fieldRules) {
      const error = rule(values[field], values);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });

  return errors;
};
