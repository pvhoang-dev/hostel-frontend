import { useContext } from "react";
import { AlertContext } from "../../contexts/AlertContext";

const Alert = () => {
  const { alert, hideAlert } = useContext(AlertContext);

  if (!alert) return null;

  const { message, type } = alert;

  const alertClasses = {
    success: "alert alert-success",
    error: "alert alert-danger",
    warning: "alert alert-warning bg-warning text-white border-0",
    info: "alert alert-info bg-info text-white border-0",
  };

  return (
    <div className={`${alertClasses[type]} mb-4`} role="alert">
      <div className="d-flex align-items-center justify-content-between">
        <p className="mb-0">{message}</p>
        <button
          type="button"
          className="close"
          data-dismiss="alert"
          aria-label="Close"
          onClick={hideAlert}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  );
};

export default Alert;
