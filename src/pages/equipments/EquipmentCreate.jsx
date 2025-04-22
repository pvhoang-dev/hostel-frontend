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
      showSuccess("Tạo thiết bị thành công");
      navigate("/equipments");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Lỗi khi tạo thiết bị");
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3 className="fs-2 fw-semibold">Tạo thiết bị</h3>
        <button
          onClick={() => navigate("/equipments")}
          className="btn btn-light fw-semibold"
        >
          Back
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
