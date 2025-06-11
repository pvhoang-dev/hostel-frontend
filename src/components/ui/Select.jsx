import { forwardRef } from "react";
import ReactSelect from "react-select";

// Custom styles cho ReactSelect trong dark mode
const darkModeSelectStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    backgroundColor: '#404954',
    borderColor: state.isFocused ? '#6c757d' : state.isInvalid ? '#dc3545' : '#555',
    boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(130, 138, 145, 0.5)' : null,
    '&:hover': {
      borderColor: '#6c757d'
    },
    color: 'white',
    minHeight: '38px',
    height: 'auto',
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: '#404954',
    zIndex: 9999,
  }),
  option: (baseStyles, state) => ({
    ...baseStyles,
    backgroundColor: state.isSelected ? '#0d6efd' : 
                     state.isFocused ? '#495057' : '#404954',
    color: 'white',
    '&:hover': {
      backgroundColor: '#495057',
    }
  }),
  singleValue: (baseStyles) => ({
    ...baseStyles,
    color: 'white',
  }),
  input: (baseStyles) => ({
    ...baseStyles,
    color: 'white',
  }),
  placeholder: (baseStyles) => ({
    ...baseStyles,
    color: '#adb5bd',
  }),
  loadingMessage: (baseStyles) => ({
    ...baseStyles,
    color: 'white',
  }),
  noOptionsMessage: (baseStyles) => ({
    ...baseStyles,
    color: 'white',
  }),
  multiValue: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: '#495057',
  }),
  multiValueLabel: (baseStyles) => ({
    ...baseStyles,
    color: 'white',
  }),
  multiValueRemove: (baseStyles) => ({
    ...baseStyles,
    color: 'white',
    '&:hover': {
      backgroundColor: '#dc3545',
      color: 'white',
    }
  }),
};

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
    // Chuyển đổi event onChange để giữ tương thích với logic hiện tại
    const handleChange = (selectedOption) => {
      // Tạo một sự kiện giả lập tương tự với sự kiện của select HTML
      const simulatedEvent = {
        target: {
          name: name,
          value: selectedOption ? selectedOption.value : "",
        },
      };
      
      onChange(simulatedEvent);
    };
    
    // Tìm option hiện tại từ giá trị value
    const currentOption = options.find(option => option.value === value) || null;
    
    // Thêm option placeholder nếu cần
    const selectOptions = options;
    
    return (
      <div className="form-group mb-3">
        {label && (
          <label htmlFor={name + "id"} className="form-label">
            {label} {required && <span className="text-danger">*</span>}
          </label>
        )}
        
        <ReactSelect
          ref={ref}
          inputId={name + "id"}
          name={name}
          value={currentOption}
          onChange={handleChange}
          onBlur={onBlur && (() => onBlur({ target: { name } }))}
          options={selectOptions}
          placeholder={placeholder}
          className={`react-select-container ${error ? "is-invalid" : ""} ${className}`}
          classNamePrefix="react-select"
          isSearchable
          styles={{
            ...darkModeSelectStyles,
            control: (base, state) => ({
              ...darkModeSelectStyles.control(base, state),
              borderColor: error ? '#dc3545' : state.isFocused ? '#6c757d' : '#555',
              '&:hover': {
                borderColor: error ? '#dc3545' : '#6c757d',
              }
            })
          }}
          {...props}
        />
        
        {error && <div className="invalid-feedback" style={{ display: 'block' }}>{error}</div>}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
