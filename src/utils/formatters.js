// src/utils/formatters.js
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return date.toLocaleDateString(undefined, { ...defaultOptions, ...options });
};

export const formatCurrency = (amount, currency = "VND") => {
  if (amount === null || amount === undefined) return "";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
  }).format(amount);
};

export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return "";

  // Remove all non-digits
  const digits = phoneNumber.replace(/\D/g, "");

  // Format for Vietnam phone numbers (example)
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  return phoneNumber;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";

  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength) + "...";
};

export const capitalizeFirstLetter = (string) => {
  if (!string) return "";

  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const formatFullName = (firstName, lastName) => {
  return [firstName, lastName].filter(Boolean).join(" ");
};
