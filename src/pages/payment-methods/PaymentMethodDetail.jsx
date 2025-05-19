import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { paymentMethodService } from "../../api/paymentMethods";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";

const PaymentMethodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useAlert();
  const [paymentMethod, setPaymentMethod] = useState(null);
  const { isAdmin } = useAuth();

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
      showError("Lỗi khi tải phương thức thanh toán");
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
        <h3 className="fs-2 fw-semibold">Thông tin phương thức thanh toán</h3>
        <div className="d-flex gap-2">
          <button
            onClick={() => navigate("/payment-methods")}
            className="btn btn-light fw-semibold mr-2"
          >
            Back
          </button>
          {isAdmin && (
            <Link
              to={`/payment-methods/${id}/edit`}
              className="btn btn-primary fw-semibold"
            >
              Sửa
            </Link>
          )}
        </div>
      </div>

      <Card>
        <div className="row">
          <div className="col-md-6 mb-4">
            <h5 className="mb-3">Thông tin cơ bản</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead style={{ backgroundColor: "rgba(0, 0, 0, .075)" }}>
                  <tr>
                    <th style={{ width: "40%" }}>Thông tin</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Name:</td>
                    <td>{paymentMethod.name}</td>
                  </tr>
                  <tr>
                    <td>Status:</td>
                    <td>
                      <span
                        className={`d-inline-block px-2 py-1 rounded small ${
                          paymentMethod.status === "active"
                            ? "bg-success text-white"
                            : "bg-danger text-white"
                        }`}
                      >
                        {paymentMethod.status?.charAt(0).toUpperCase() +
                          paymentMethod.status?.slice(1) || "Unknown"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {paymentMethod.description && (
            <div className="col-md-12 mb-4">
              <h5 className="mb-3">Mô tả</h5>
              <div className="p-3 border rounded">
                <p className="mb-0">{paymentMethod.description}</p>
              </div>
            </div>
          )}

          <div className="col-md-12 mb-4">
            <h5 className="mb-3">Thông tin hệ thống</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead style={{ backgroundColor: "rgba(0, 0, 0, .075)" }}>
                  <tr>
                    <th style={{ width: "200px" }}>Thông tin</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ID:</td>
                    <td>{paymentMethod.id}</td>
                  </tr>
                  <tr>
                    <td>Tạo:</td>
                    <td>{paymentMethod.created_at}</td>
                  </tr>
                  <tr>
                    <td>Cập nhật lần cuối:</td>
                    <td>{paymentMethod.updated_at}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentMethodDetail;
