// src/components/common/Select.jsx
import { forwardRef } from "react";

const Select = forwardRef(
  (
    {
      label,
      name,
      value,
      onChange,
      onBlur,
      options = [],
      placeholder = "Chọn 1 giá trị",
      error,
      required = false,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className="mb-4">
        {label && (
          <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full p-2 border rounded ${
            error ? "border-red-500" : "border-gray-300"
          } ${className}`}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
