import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { paymentMethodService } from "../../api/paymentMethods";
import PaymentMethodForm from "../../components/forms/PaymentMethodForm";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const PaymentMethodEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();

  const [paymentMethodData, setPaymentMethodData] = useState(null);
  const [errors, setErrors] = useState({});

  const { execute: fetchPaymentMethod, loading: loadingPaymentMethod } = useApi(
    paymentMethodService.getPaymentMethod
  );

  const { execute: updatePaymentMethod, loading: isSubmitting } = useApi(
    paymentMethodService.updatePaymentMethod
  );

  useEffect(() => {
    loadPaymentMethod();
  }, [id]);

  const loadPaymentMethod = async () => {
    const response = await fetchPaymentMethod(id);

    if (response.success) {
      setPaymentMethodData(response.data);
    } else {
      showError("Lỗi khi tải phương thức thanh toán");
      navigate("/payment-methods");
    }
  };

  const handleSubmit = async (formData) => {
    const response = await updatePaymentMethod(id, formData);

    if (response.success) {
      showSuccess("Cập nhật phương thức thanh toán thành công");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(
          response.message || "Lỗi khi cập nhật phương thức thanh toán"
        );
      }
    }
  };

  if (loadingPaymentMethod) {
    return <Loader />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3 className="fs-2 fw-semibold">Chỉnh sửa phương thức thanh toán</h3>
        <button
          onClick={() => navigate("/payment-methods")}
          className="btn btn-light fw-semibold"
        >
          Back
        </button>
      </div>

      <Card>
        {paymentMethodData && (
          <PaymentMethodForm
            initialData={paymentMethodData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            errors={errors}
            mode="edit"
          />
        )}
      </Card>
    </div>
  );
};

export default PaymentMethodEdit;
