// src/components/common/Input.jsx
import { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      type = "text",
      label,
      name,
      value,
      onChange,
      onBlur,
      placeholder,
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
        <input
          ref={ref}
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full p-2 border rounded ${
            error ? "border-red-500" : "border-gray-300"
          } ${className}`}
          {...props}
        />
        {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
