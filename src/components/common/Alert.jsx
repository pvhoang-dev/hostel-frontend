// src/components/common/Alert.jsx
import { useContext } from "react";
import { AlertContext } from "../../contexts/AlertContext";

const Alert = () => {
  const { alert, hideAlert } = useContext(AlertContext);

  if (!alert) return null;

  const { message, type } = alert;

  const alertClasses = {
    success: "bg-green-100 border-green-500 text-green-700",
    error: "bg-red-100 border-red-500 text-red-700",
    warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
    info: "bg-blue-100 border-blue-500 text-blue-700",
  };

  return (
    <div className={`border-l-4 p-4 mb-4 ${alertClasses[type]}`} role="alert">
      <div className="flex items-center justify-between">
        <p>{message}</p>
        <button onClick={hideAlert} className="ml-4">
          ×
        </button>
      </div>
    </div>
  );
};

export default Alert;
