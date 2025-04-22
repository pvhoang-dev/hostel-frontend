import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { roomService } from "../../api/rooms";
import RoomForm from "../../components/forms/RoomForm";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";

const RoomEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const { user } = useAuth();

  const [roomData, setRoomData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const { execute: updateRoom, loading: isSubmitting } = useApi(
    roomService.updateRoom
  );
  const { execute: fetchRoom } = useApi(roomService.getRoom);

  useEffect(() => {
    if (user) {
      loadRoom();
    }
  }, [id, user]);

  const loadRoom = async () => {
    setLoading(true);
    const response = await fetchRoom(id);

    if (response.success) {
      setRoomData(response.data);

      // Check if user has permission to edit
      if (user) {
        const isAdmin = user.role === "admin";
        const isManager = user.role === "manager";
        const isHouseManager = response.data.house?.manager_id === user.id;

        if (!isAdmin && !(isManager && isHouseManager)) {
          showError("Bạn không có quyền chỉnh sửa phòng này");
          navigate(`/rooms/${id}`);
          return;
        }
      }
    } else {
      showError("Lỗi khi tải thông tin phòng");
      navigate("/rooms");
    }
    setLoading(false);
  };

  const handleSubmit = async (formData) => {
    const response = await updateRoom(id, formData);

    if (response.success) {
      showSuccess("Cập nhật phòng thành công");
      navigate("/rooms");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Có lỗi xảy ra khi cập nhật phòng");
      }
    }
  };

  // Nếu chưa có thông tin user, hiển thị loading
  if (!user) {
    return <Loader />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Chỉnh sửa phòng</h1>
        <button
          onClick={() => navigate("/rooms")}
          className="btn btn-light fw-semibold"
        >
          Back
        </button>
      </div>

      <Card>
        {roomData && (
          <RoomForm
            initialData={roomData}
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

export default RoomEdit;
