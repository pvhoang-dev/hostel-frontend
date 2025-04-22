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
      <div className="mb-3">
        {label && (
          <label htmlFor={name} className="form-label">
            {label} {required && <span className="text-danger">*</span>}
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
          className={`form-control ${error ? "is-invalid" : ""} ${className}`}
          {...props}
        />
        {error && <div className="invalid-feedback">{error}</div>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
