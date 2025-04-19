// src/hooks/useAlert.js
import { useContext } from "react";
import { AlertContext } from "../contexts/AlertContext";

/**
 * Custom hook to access the Alert context
 * @returns {Object} Alert context functions and state
 */
const useAlert = () => {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }

  return {
    alert: context.alert,
    showAlert: context.showAlert,
    hideAlert: context.hideAlert,
    showSuccess: context.showSuccess,
    showError: context.showError,
    showWarning: context.showWarning,
    showInfo: context.showInfo,
  };
};

export default useAlert;
