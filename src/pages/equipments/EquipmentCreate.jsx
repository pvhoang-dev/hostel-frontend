// src/pages/equipments/EquipmentCreate.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { equipmentService } from "../../api/equipments";
import EquipmentForm from "../../components/forms/EquipmentForm";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const EquipmentCreate = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useAlert();
    const [errors, setErrors] = useState({});

    const { execute: createEquipment, loading: isSubmitting } = useApi(
        equipmentService.createEquipment
    );

    const handleSubmit = async (formData) => {
        const response = await createEquipment(formData);

        if (response.success) {
            showSuccess("Equipment created successfully");
            navigate("/equipments");
        } else {
            if (response.data && typeof response.data === "object") {
                setErrors(response.data);
            } else {
                showError(response.message || "Failed to create equipment");
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Create Equipment</h1>
                <button
                    onClick={() => navigate("/equipments")}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
                >
                    Back to Equipments
                </button>
            </div>

            <Card>
                <EquipmentForm
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    errors={errors}
                    mode="create"
                />
            </Card>
        </div>
    );
};

export default EquipmentCreate;