import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { paymentMethodService } from "../../api/paymentMethods";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const PaymentMethodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useAlert();
  const [paymentMethod, setPaymentMethod] = useState(null);

  const { execute: fetchPaymentMethod, loading } = useApi(
    paymentMethodService.getPaymentMethod
  );

  useEffect(() => {
    loadPaymentMethod();
  }, [id]);

  const loadPaymentMethod = async () => {
    const response = await fetchPaymentMethod(id);

    if (response.success) {
      setPaymentMethod(response.data);
    } else {
      showError("Failed to load payment method");
      navigate("/payment-methods");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!paymentMethod) {
    return <div>Payment method not found</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Payment Method Details</h1>
        <div className="d-flex gap-2">
          <button
            onClick={() => navigate("/payment-methods")}
            className="btn btn-light fw-semibold mr-2"
          >
            Back
          </button>
          <Link
            to={`/payment-methods/${id}/edit`}
            className="btn btn-primary fw-semibold"
          >
            Sửa
          </Link>
        </div>
      </div>

      <Card>
        <div className="d-flex flex-column gap-4">
          <div>
            <h2 className="fs-5 fw-semibold mb-2">Basic Information</h2>
            <div className="row g-4">
              <div className="col-12 col-md-6">
                <span className="text-secondary">Name:</span>
                <span className="ms-2 fw-medium">{paymentMethod.name}</span>
              </div>
              <div className="col-12 col-md-6">
                <span className="text-secondary">Status:</span>
                <span
                  className={`ms-2 d-inline-block px-2 py-1 rounded small ${
                    paymentMethod.status === "active"
                      ? "bg-success bg-opacity-10 text-success"
                      : "bg-danger bg-opacity-10 text-danger"
                  }`}
                >
                  {paymentMethod.status?.charAt(0).toUpperCase() +
                    paymentMethod.status?.slice(1) || "Unknown"}
                </span>
              </div>
            </div>
          </div>

          {paymentMethod.description && (
            <div>
              <h2 className="fs-5 fw-semibold mb-2">Description</h2>
              <p className="text-secondary">{paymentMethod.description}</p>
            </div>
          )}

          <div>
            <h2 className="fs-5 fw-semibold mb-2">System Information</h2>
            <div className="row g-4">
              <div className="col-12 col-md-6">
                <span className="text-secondary">ID:</span>
                <span className="ms-2">{paymentMethod.id}</span>
              </div>
              <div className="col-12 col-md-6">
                <span className="text-secondary">Created At:</span>
                <span className="ms-2">
                  {new Date(paymentMethod.created_at).toLocaleString()}
                </span>
              </div>
              <div className="col-12 col-md-6">
                <span className="text-secondary">Last Updated:</span>
                <span className="ms-2">
                  {new Date(paymentMethod.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentMethodDetail;
