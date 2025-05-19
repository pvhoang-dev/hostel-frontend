import React from "react";

const TextArea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  rows = 3,
  ...props
}) => {
  return (
    <div className="form-group mb-3">
      {label && (
        <label htmlFor={name} className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className={`form-control ${error ? "is-invalid" : ""}`}
        required={required}
        {...props}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default TextArea;
