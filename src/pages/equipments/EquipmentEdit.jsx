// src/pages/equipments/EquipmentEdit.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { equipmentService } from "../../api/equipments";
import EquipmentForm from "../../components/forms/EquipmentForm";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const EquipmentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();

  const [equipmentData, setEquipmentData] = useState(null);
  const [errors, setErrors] = useState({});

  const { execute: updateEquipment, loading: isSubmitting } = useApi(
    equipmentService.updateEquipment
  );
  const { execute: fetchEquipment, loading } = useApi(
    equipmentService.getEquipment
  );

  useEffect(() => {
    loadEquipment();
  }, [id]);

  const loadEquipment = async () => {
    const response = await fetchEquipment(id);

    if (response.success) {
      setEquipmentData(response.data);
    } else {
      showError("Failed to load equipment");
      navigate("/equipments");
    }
  };

  const handleSubmit = async (formData) => {
    const response = await updateEquipment(id, formData);

    if (response.success) {
      showSuccess("Equipment updated successfully");
      navigate("/equipments");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Failed to update equipment");
      }
    }
  };

  if (loading || !equipmentData) {
    return <Loader />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Edit Equipment</h1>
        <button
          onClick={() => navigate("/equipments")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Back to Equipments
        </button>
      </div>

      <Card>
        <EquipmentForm
          initialData={equipmentData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="edit"
        />
      </Card>
    </div>
  );
};

export default EquipmentEdit;
