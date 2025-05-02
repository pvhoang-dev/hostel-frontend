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
      <div className="form-group mb-3">
        {label && (
          <label htmlFor={name + "id"} className="form-label">
            {label} {required && <span className="text-danger">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={name + "id"}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`form-control ${error ? "is-invalid" : ""} ${className}`}
          {...props}
          required={required}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <div className="invalid-feedback">{error}</div>}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
