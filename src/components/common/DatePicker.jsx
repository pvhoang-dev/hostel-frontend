import React from "react";

const DatePicker = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  ...props
}) => {
  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type="date"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`mt-1 block w-full rounded-md ${
          error ? "border-red-300" : "border-gray-300"
        } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
        required={required}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default DatePicker; 