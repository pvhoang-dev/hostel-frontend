import React, { forwardRef } from "react";

const Checkbox = forwardRef(
  (
    {
      label,
      name,
      checked,
      onChange,
      error,
      required = false,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className="form-group mb-3">
        <div className="custom-control custom-checkbox">
          <input
            ref={ref}
            type="checkbox"
            id={name}
            name={name}
            className={`custom-control-input ${
              error ? "is-invalid" : ""
            } ${className}`}
            checked={checked}
            onChange={onChange}
            required={required}
            {...props}
          />
          <label className="custom-control-label" htmlFor={name}>
            {label} {required && <span className="text-danger">*</span>}
          </label>
        </div>
        {error && <div className="invalid-feedback d-block">{error}</div>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
