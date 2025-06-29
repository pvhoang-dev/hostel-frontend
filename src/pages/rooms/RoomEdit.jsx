import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { roomService } from "../../api/rooms";
import RoomForm from "../../components/forms/RoomForm";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";

const RoomEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const { user, isAdmin, isManager } = useAuth();
  const location = useLocation();
  const fromHouseDetail = location.state?.fromHouseDetail;
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
      // Ensure house_id is properly set in the room data
      const processedData = {
        ...response.data,
        house_id: response.data.house?.id || response.data.house_id,
      };

      setRoomData(processedData);

      // Check if user has permission to edit
      if (user) {
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

      // Navigate back to house detail if we came from there
      if (fromHouseDetail && roomData?.house?.id) {
        navigate(`/houses/${roomData.house.id}`);
      } else {
        navigate("/rooms");
      }
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Có lỗi xảy ra khi cập nhật phòng");
      }
    }
  };

  // Determine the back button URL
  const getBackUrl = () => {
    if (fromHouseDetail && roomData?.house?.id) {
      return `/houses/${roomData.house.id}`;
    }
    return "/rooms";
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
          onClick={() => navigate(getBackUrl())}
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
