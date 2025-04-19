// src/contexts/AlertContext.jsx
import { createContext, useState } from "react";

export const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = "info", timeout = 5000) => {
    setAlert({ message, type });

    if (timeout > 0) {
      setTimeout(() => {
        setAlert(null);
      }, timeout);
    }
  };

  const hideAlert = () => {
    setAlert(null);
  };

  const value = {
    alert,
    showAlert,
    hideAlert,
    showSuccess: (message) => showAlert(message, "success"),
    showError: (message) => showAlert(message, "error"),
    showWarning: (message) => showAlert(message, "warning"),
    showInfo: (message) => showAlert(message, "info"),
  };

  return (
    <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
  );
};
