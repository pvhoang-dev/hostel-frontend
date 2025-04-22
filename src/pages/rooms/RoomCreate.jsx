import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { roomService } from "../../api/rooms";
import RoomForm from "../../components/forms/RoomForm";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const RoomCreate = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [errors, setErrors] = useState({});

  const { execute: createRoom, loading: isSubmitting } = useApi(
    roomService.createRoom
  );

  const handleSubmit = async (formData) => {
    const response = await createRoom(formData);

    if (response.success) {
      showSuccess("Tạo phòng thành công");
      navigate("/rooms");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Có lỗi xảy ra khi tạo phòng");
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Tạo phòng mới</h1>
        <button
          onClick={() => navigate("/rooms")}
          className="btn btn-light fw-semibold"
        >
          Back
        </button>
      </div>

      <Card>
        <RoomForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="create"
        />
      </Card>
    </div>
  );
};

export default RoomCreate;
