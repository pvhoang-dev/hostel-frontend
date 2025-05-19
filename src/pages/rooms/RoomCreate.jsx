import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { roomService } from "../../api/rooms";
import RoomForm from "../../components/forms/RoomForm";
import Card from "../../components/ui/Card";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const RoomCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const houseId = searchParams.get("house_id");
  const { showSuccess, showError } = useAlert();
  const [errors, setErrors] = useState({});

  const { execute: createRoom, loading: isSubmitting } = useApi(
    roomService.createRoom
  );

  const handleSubmit = async (formData) => {
    const response = await createRoom(formData);

    if (response.success) {
      showSuccess("Tạo phòng thành công");

      // If we came from a house detail page, go back to that page
      if (houseId) {
        navigate(`/houses/${houseId}`);
      } else {
        navigate("/rooms");
      }
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Có lỗi xảy ra khi tạo phòng");
      }
    }
  };

  // Determine the "Back" button URL
  const backUrl = houseId ? `/houses/${houseId}` : "/rooms";

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Tạo phòng mới</h1>
        <button
          onClick={() => navigate(backUrl)}
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
          initialValues={houseId ? { house_id: houseId } : {}}
          houseId={houseId}
        />
      </Card>
    </div>
  );
};

export default RoomCreate;
