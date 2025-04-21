import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { roomService } from "../../api/rooms";
import RoomForm from "../../components/forms/RoomForm";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";

const RoomCreate = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [errors, setErrors] = useState({});
  const { user } = useAuth();
  const { houseId } = useParams();  // Optional house ID for creating rooms within a house

  const { execute: createRoom, loading: isSubmitting } = useApi(
    roomService.createRoom
  );

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  if (!user) {
    return <Loader />;
  }

  // Only admins and managers can create rooms
  if (!isAdmin && !isManager) {
    navigate("/rooms");
    return null;
  }

  const handleSubmit = async (formData) => {
    const response = await createRoom(formData);

    if (response.success) {
      showSuccess("Tạo phòng mới thành công");
      navigate("/rooms");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Có lỗi xảy ra khi tạo phòng mới");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Tạo phòng mới</h1>
        <button
          onClick={() => navigate("/rooms")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Quay lại
        </button>
      </div>

      <Card>
        <RoomForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="create"
          houseId={houseId}
        />
      </Card>
    </div>
  );
};

export default RoomCreate;
