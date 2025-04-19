// src/components/common/Button.jsx
import React from "react";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  className = "",
  as: Component = "button",
  ...props
}) => {
  const variantClasses = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    success: "bg-green-500 hover:bg-green-600 text-white",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-white",
  };

  const sizeClasses = {
    sm: "py-1 px-2 text-sm",
    md: "py-2 px-4",
    lg: "py-3 px-6 text-lg",
  };

  const buttonProps = Component === "button" ? { type } : {};

  return (
    <Component
      {...buttonProps}
      onClick={onClick}
      disabled={disabled}
      className={`font-medium rounded transition-colors ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Button;
