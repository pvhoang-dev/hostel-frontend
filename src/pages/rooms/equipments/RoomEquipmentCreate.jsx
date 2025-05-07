import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { roomService } from "../../../api/rooms";
import { roomEquipmentService } from "../../../api/roomEquipments";
import { storageService } from "../../../api/storages";
import RoomEquipmentForm from "../../../components/forms/RoomEquipmentForm";
import Loader from "../../../components/common/Loader";
import useAlert from "../../../hooks/useAlert";
import useApi from "../../../hooks/useApi";
import { useAuth } from "../../../hooks/useAuth";

const RoomEquipmentCreate = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const houseId = searchParams.get("house_id");
  const { showSuccess, showError } = useAlert();
  const { isAdmin, isManager, user } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(true);

  const {
    data: room,
    loading: loadingRoom,
    execute: fetchRoom,
  } = useApi(roomService.getRoom);

  const { loading: creating, execute: createRoomEquipment } = useApi(
    roomEquipmentService.createRoomEquipment
  );

  const { execute: getStorages } = useApi(storageService.getStorages);
  const { execute: updateStorage } = useApi(storageService.updateStorage);

  // Load room data
  useEffect(() => {
    if (roomId) fetchRoom(roomId, { include: "house" });
  }, [roomId]);

  // Check authorization
  useEffect(() => {
    if (room && !isAdmin) {
      if (isManager && room.house?.manager_id !== user?.id) {
        setIsAuthorized(false);
        showError("Bạn không có quyền thêm thiết bị vào phòng này");
        navigate(`/rooms/${roomId}`);
      }
    }
  }, [room, isAdmin, isManager, user?.id]);

  const handleSubmit = async (formData) => {
    try {
      // If equipment is from storage, update storage quantity
      if (formData.source === "storage") {
        const storageResponse = await getStorages({
          equipment_id: formData.equipment_id,
          house_id: houseId || room?.house?.id,
        });

        if (storageResponse.success && storageResponse.data.data.length > 0) {
          const storage = storageResponse.data.data[0];
          const newQuantity = Math.max(0, storage.quantity - formData.quantity);

          // Update storage first
          const updateResponse = await updateStorage(storage.id, {
            quantity: newQuantity,
          });

          if (!updateResponse.success) {
            showError("Có lỗi xảy ra khi cập nhật kho");
            return;
          }
        } else {
          showError("Không tìm thấy thiết bị trong kho");
          return;
        }
      }

      // Create room equipment
      const response = await createRoomEquipment(formData);

      if (response.success) {
        showSuccess("Thêm thiết bị vào phòng thành công");
        navigate(`/rooms/${roomId}`);
      } else {
        showError(
          response.message || "Có lỗi xảy ra khi thêm thiết bị vào phòng"
        );
      }
    } catch (error) {
      console.error("Error creating room equipment:", error);
      showError("Có lỗi xảy ra khi thêm thiết bị vào phòng");
    }
  };

  if (loadingRoom) return <Loader />;
  if (!isAuthorized) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3 className="fs-2 fw-semibold">Thêm thiết bị vào phòng</h3>
        <button
          onClick={() => navigate(`/rooms/${roomId}`)}
          className="btn btn-light fw-semibold"
        >
          Quay lại
        </button>
      </div>

      <RoomEquipmentForm
        roomId={roomId}
        houseId={houseId || room?.house?.id}
        onSubmit={handleSubmit}
        submitButtonText="Thêm thiết bị"
        mode="create"
      />
    </div>
  );
};

export default RoomEquipmentCreate;
