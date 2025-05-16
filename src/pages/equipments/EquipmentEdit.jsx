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
      showError("Lỗi khi tải thiết bị");
      navigate("/equipments");
    }
  };

  const handleSubmit = async (formData) => {
    const response = await updateEquipment(id, formData);

    if (response.success) {
      showSuccess("Cập nhật thiết bị thành công");
      navigate("/equipments");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Lỗi khi cập nhật thiết bị");
      }
    }
  };

  if (loading || !equipmentData) {
    return <Loader />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3 className="fs-2 fw-semibold">Chỉnh sửa thiết bị</h3>
        <button
          onClick={() => navigate("/equipments")}
          className="btn btn-light fw-semibold"
        >
          Back
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
