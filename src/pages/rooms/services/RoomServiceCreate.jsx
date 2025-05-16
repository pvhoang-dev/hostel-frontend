import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../../components/common/Card";
import Loader from "../../../components/common/Loader";
import useAlert from "../../../hooks/useAlert";
import useApi from "../../../hooks/useApi";
import { roomService } from "../../../api/rooms";
import { roomServiceService } from "../../../api/roomServices";
import { serviceService } from "../../../api/services";
import RoomServiceForm from "../../../components/forms/RoomServiceForm";

const RoomServiceCreate = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();

  // API hooks
  const {
    data: room,
    loading: loadingRoom,
    execute: fetchRoom,
  } = useApi(roomService.getRoom);

  const {
    data: servicesData,
    loading: loadingServices,
    execute: fetchServices,
  } = useApi(serviceService.getServices);

  const {
    data: roomServicesData,
    loading: loadingRoomServices,
    execute: fetchRoomServices,
  } = useApi(roomServiceService.getRoomServices);

  const { loading: submitting, execute: createRoomService } = useApi(
    roomServiceService.createRoomService
  );

  const { loading: updating, execute: updateRoomService } = useApi(
    roomServiceService.updateRoomService
  );

  // Lưu danh sách room services hiện có (bao gồm cả inactive)
  const [existingRoomServices, setExistingRoomServices] = useState([]);

  useEffect(() => {
    loadRoom();
    loadServices();
    loadRoomServices();
  }, [roomId]);

  useEffect(() => {
    if (roomServicesData) {
      setExistingRoomServices(roomServicesData.data || []);
    }
  }, [roomServicesData]);

  const loadRoom = async () => {
    const response = await fetchRoom(roomId, { include: "house" });
    if (!response.success) {
      showError("Lỗi khi tải thông tin phòng");
      navigate("/rooms");
    }
  };

  const loadServices = async () => {
    const response = await fetchServices();
    if (!response.success) {
      showError("Lỗi khi tải danh sách dịch vụ");
    }
  };

  const loadRoomServices = async () => {
    const response = await fetchRoomServices({
      room_id: roomId,
      include: "service",
    });
    if (!response.success) {
      showError("Lỗi khi tải danh sách dịch vụ phòng");
    }
  };

  // Lọc danh sách service
  const availableServices =
    servicesData?.data?.filter((service) => {
      // Kiểm tra xem service có nằm trong danh sách room services không
      const existingService = existingRoomServices.find(
        (rs) => rs.service?.id === service.id || rs.service_id === service.id
      );

      // Chỉ lấy những service chưa có trong phòng hoặc đã có nhưng status = inactive
      return !existingService || existingService.status === "inactive";
    }) || [];

  const handleSubmit = async (values) => {
    try {
      // Kiểm tra xem service đã tồn tại trong phòng chưa
      const existingService = existingRoomServices.find(
        (rs) =>
          rs.service?.id === Number(values.service_id) ||
          rs.service_id === Number(values.service_id)
      );

      if (existingService && existingService.status === "inactive") {
        // Nếu đã tồn tại và inactive, cập nhật thành active
        const updateData = {
          ...values,
          status: values.status || "active",
        };

        const response = await updateRoomService(
          existingService.id,
          updateData
        );

        if (response.success) {
          showSuccess("Kích hoạt dịch vụ phòng thành công");
          navigate(`/rooms/${roomId}`);
        } else {
          showError(
            response.message || "Có lỗi xảy ra khi cập nhật dịch vụ phòng"
          );
        }
      } else {
        // Nếu chưa tồn tại, tạo mới
        const roomServiceData = {
          ...values,
          room_id: roomId,
        };

        const response = await createRoomService(roomServiceData);

        if (response.success) {
          showSuccess("Thêm dịch vụ phòng thành công");
          navigate(`/rooms/${roomId}`);
        } else {
          showError(response.message || "Có lỗi xảy ra khi thêm dịch vụ phòng");
        }
      }
    } catch (error) {
      console.error("Error handling room service:", error);
      showError("Có lỗi xảy ra khi xử lý dịch vụ phòng");
    }
  };

  if (loadingRoom || loadingServices || loadingRoomServices) {
    return <Loader />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fs-4">Thêm dịch vụ cho phòng {room?.room_number}</h3>
        <button
          onClick={() => navigate(`/rooms/${roomId}`)}
          className="btn btn-light"
        >
          Quay lại
        </button>
      </div>

      <Card>
        <RoomServiceForm
          onSubmit={handleSubmit}
          submitting={submitting || updating}
          services={availableServices}
        />
      </Card>
    </div>
  );
};

export default RoomServiceCreate;
