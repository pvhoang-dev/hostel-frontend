import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { roomService } from "../../../api/rooms";
import { roomEquipmentService } from "../../../api/roomEquipments";
import { storageService } from "../../../api/storages";
import RoomEquipmentForm from "../../../components/forms/RoomEquipmentForm";
import Loader from "../../../components/ui/Loader";
import useAlert from "../../../hooks/useAlert";
import useApi from "../../../hooks/useApi";
import { useAuth } from "../../../hooks/useAuth";

const RoomEquipmentEdit = () => {
  const { roomId, equipmentId } = useParams();
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

  const {
    data: roomEquipment,
    loading: loadingRoomEquipment,
    execute: fetchRoomEquipment,
  } = useApi(roomEquipmentService.getRoomEquipment);

  const { loading: updating, execute: updateRoomEquipment } = useApi(
    roomEquipmentService.updateRoomEquipment
  );

  const { execute: createStorage } = useApi(storageService.createStorage);
  const { execute: updateStorage } = useApi(storageService.updateStorage);
  const { execute: getStorages } = useApi(storageService.getStorages);

  // Load room and room equipment data
  useEffect(() => {
    if (roomId) fetchRoom(roomId, { include: "house" });
    if (equipmentId) fetchRoomEquipment(equipmentId);
  }, [roomId, equipmentId]);

  // Check authorization
  useEffect(() => {
    if (room && !isAdmin) {
      if (isManager && room.house?.manager_id !== user?.id) {
        setIsAuthorized(false);
        showError("Bạn không có quyền chỉnh sửa thiết bị cho phòng này");
        navigate(`/rooms/${roomId}`);
      }
    }
  }, [room, isAdmin, isManager, user?.id]);

  // Find or create storage for an equipment
  const findOrCreateStorage = async (equipmentId, houseId, quantity, price) => {
    try {
      // Check if storage exists for this equipment in this house
      const storageResponse = await getStorages({
        equipment_id: equipmentId,
        house_id: houseId,
      });

      if (storageResponse.success) {
        if (storageResponse.data.data && storageResponse.data.data.length > 0) {
          // Storage exists, return it
          return {
            exists: true,
            storage: storageResponse.data.data[0],
          };
        } else {
          // Storage doesn't exist, create it
          const createResponse = await createStorage({
            equipment_id: equipmentId,
            house_id: houseId,
            quantity: quantity || 0,
            price: price || 0,
          });

          if (createResponse.success) {
            showSuccess("Đã tạo mới thiết bị trong kho");
            return {
              exists: false,
              storage: createResponse.data,
            };
          } else {
            showError("Có lỗi xảy ra khi tạo kho mới");
            return { error: true };
          }
        }
      } else {
        showError("Có lỗi xảy ra khi kiểm tra kho");
        return { error: true };
      }
    } catch (error) {
      console.error("Error managing storage:", error);
      showError("Có lỗi xảy ra khi quản lý kho");
      return { error: true };
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const currentHouseId = houseId || room?.house?.id;

      // Handle storage updates based on quantity changes
      if (roomEquipment?.source === "storage") {
        // Only interact with storage if:
        // 1. Quantity is increasing AND user chose to use storage
        // 2. Quantity is decreasing AND user chose to return to storage
        const isIncreasingAndUsingStorage =
          formData.is_quantity_increase && formData.use_storage === true;
        const isDecreasingAndReturningToStorage =
          formData.is_quantity_decrease && formData.update_storage === true;

        if (isIncreasingAndUsingStorage || isDecreasingAndReturningToStorage) {
          // First check if storage entry exists, create if not
          const storageResult = await findOrCreateStorage(
            roomEquipment.equipment.id,
            currentHouseId,
            0,
            roomEquipment.price
          );

          if (storageResult.error) {
            return; // Stop if there was an error
          }

          const storage = storageResult.storage;
          let newStorageQuantity = storage.quantity;

          // If quantity is increasing and using storage
          if (isIncreasingAndUsingStorage) {
            // Check if there's enough in storage
            if (storage.quantity < formData.additional_quantity) {
              showError(
                `Không đủ số lượng trong kho. Hiện có ${storage.quantity} thiết bị.`
              );
              return;
            }

            newStorageQuantity = Math.max(
              0,
              storage.quantity - formData.additional_quantity
            );
          }
          // If quantity is decreasing and returning to storage
          else if (isDecreasingAndReturningToStorage) {
            newStorageQuantity = storage.quantity + formData.return_quantity;
          }

          // Update storage if quantity changed
          if (newStorageQuantity !== storage.quantity) {
            const updateResponse = await updateStorage(storage.id, {
              quantity: newStorageQuantity,
            });

            if (!updateResponse.success) {
              showError("Có lỗi xảy ra khi cập nhật kho");
              return;
            }

            if (isIncreasingAndUsingStorage) {
              showSuccess(
                `Đã lấy ${formData.additional_quantity} thiết bị từ kho`
              );
            } else if (isDecreasingAndReturningToStorage) {
              showSuccess(`Đã trả ${formData.return_quantity} thiết bị về kho`);
            }
          }
        }
      }

      // Update room equipment
      const response = await updateRoomEquipment(equipmentId, formData);

      if (response.success) {
        showSuccess("Cập nhật thiết bị phòng thành công");
        navigate(`/rooms/${roomId}`);
      } else {
        showError(
          response.message || "Có lỗi xảy ra khi cập nhật thiết bị phòng"
        );
      }
    } catch (error) {
      console.error("Error updating room equipment:", error);
      showError("Có lỗi xảy ra khi cập nhật thiết bị phòng");
    }
  };

  if (loadingRoom || loadingRoomEquipment) return <Loader />;
  if (!isAuthorized) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3 className="fs-2 fw-semibold">Cập nhật thiết bị phòng</h3>
        <button
          onClick={() => navigate(`/rooms/${roomId}`)}
          className="btn btn-light fw-semibold"
        >
          Quay lại
        </button>
      </div>

      {roomEquipment && (
        <RoomEquipmentForm
          roomId={roomId}
          houseId={houseId || room?.house?.id}
          initialData={roomEquipment}
          onSubmit={handleSubmit}
          submitButtonText="Cập nhật"
          mode="edit"
        />
      )}
    </div>
  );
};

export default RoomEquipmentEdit;
