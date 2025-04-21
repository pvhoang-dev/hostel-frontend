import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { paymentMethodService } from "../../api/paymentMethods";
import PaymentMethodForm from "../../components/forms/PaymentMethodForm";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
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
      showError("Failed to load payment method");
      navigate("/payment-methods");
    }
  };

  const handleSubmit = async (formData) => {
    const response = await updatePaymentMethod(id, formData);

    if (response.success) {
      showSuccess("Payment method updated successfully");
      navigate("/payment-methods");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Failed to update payment method");
      }
    }
  };

  if (loadingPaymentMethod) {
    return <Loader />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Edit Payment Method</h1>
        <button
          onClick={() => navigate("/payment-methods")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Back to Payment Methods
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
