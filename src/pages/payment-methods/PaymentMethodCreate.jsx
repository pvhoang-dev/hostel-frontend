import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { paymentMethodService } from "../../api/paymentMethods";
import PaymentMethodForm from "../../components/forms/PaymentMethodForm";
import Card from "../../components/ui/Card";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const PaymentMethodCreate = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [errors, setErrors] = useState({});

  const { execute: createPaymentMethod, loading: isSubmitting } = useApi(
    paymentMethodService.createPaymentMethod
  );

  const handleSubmit = async (formData) => {
    const response = await createPaymentMethod(formData);

    if (response.success) {
      showSuccess("Tạo phương thức thanh toán thành công");
      navigate("/payment-methods");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Lỗi khi tạo phương thức thanh toán");
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3 className="fs-2 fw-semibold">Tạo phương thức thanh toán</h3>
        <button
          onClick={() => navigate("/payment-methods")}
          className="btn btn-light fw-semibold"
        >
          Back
        </button>
      </div>

      <Card>
        <PaymentMethodForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="create"
        />
      </Card>
    </div>
  );
};

export default PaymentMethodCreate;
