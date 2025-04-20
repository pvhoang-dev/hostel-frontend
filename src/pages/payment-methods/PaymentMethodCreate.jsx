import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { paymentMethodService } from "../../api/paymentMethods";
import PaymentMethodForm from "../../components/forms/PaymentMethodForm";
import Card from "../../components/common/Card";
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
            showSuccess("Payment method created successfully");
            navigate("/payment-methods");
        } else {
            if (response.data && typeof response.data === "object") {
                setErrors(response.data);
            } else {
                showError(response.message || "Failed to create payment method");
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Create Payment Method</h1>
                <button
                    onClick={() => navigate("/payment-methods")}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
                >
                    Back to Payment Methods
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