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

    const {
        execute: fetchPaymentMethod,
        loading
    } = useApi(paymentMethodService.getPaymentMethod);

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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Payment Method Details</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => navigate("/payment-methods")}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
                    >
                        Back to Payment Methods
                    </button>
                    <Link
                        to={`/payment-methods/${id}/edit`}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                    >
                        Edit Payment Method
                    </Link>
                </div>
            </div>

            <Card>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="text-gray-600">Name:</span>
                                <span className="ml-2 font-medium">{paymentMethod.name}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Status:</span>
                                <span
                                    className={`ml-2 inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                        paymentMethod.status === "active"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                    }`}
                                >
                  {paymentMethod.status?.charAt(0).toUpperCase() + paymentMethod.status?.slice(1) || "Unknown"}
                </span>
                            </div>
                        </div>
                    </div>

                    {paymentMethod.description && (
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Description</h2>
                            <p className="text-gray-700">{paymentMethod.description}</p>
                        </div>
                    )}

                    <div>
                        <h2 className="text-lg font-semibold mb-2">System Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="text-gray-600">ID:</span>
                                <span className="ml-2">{paymentMethod.id}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Created At:</span>
                                <span className="ml-2">
                  {new Date(paymentMethod.created_at).toLocaleString()}
                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Last Updated:</span>
                                <span className="ml-2">
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