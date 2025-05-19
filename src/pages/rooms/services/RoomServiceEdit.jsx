import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Loader from "../../../components/ui/Loader";
import useAlert from "../../../hooks/useAlert";
import useApi from "../../../hooks/useApi";
import { roomServiceService } from "../../../api/roomServices";
import RoomServiceForm from "../../../components/forms/RoomServiceForm";

const RoomServiceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [errors, setErrors] = useState({});

  // API hooks
  const {
    data: roomService,
    loading: loadingRoomService,
    execute: fetchRoomService,
  } = useApi(roomServiceService.getRoomService);

  const { loading: submitting, execute: updateRoomService } = useApi(
    roomServiceService.updateRoomService
  );

  useEffect(() => {
    loadRoomService();
  }, [id]);

  const loadRoomService = async () => {
    const response = await fetchRoomService(id, {
      include: "room,service,room.house",
    });
    if (!response.success) {
      showError("Lỗi khi tải thông tin dịch vụ phòng");
      navigate("/rooms");
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Xác thực dữ liệu
      const newErrors = {};
      if (!values.price) {
        newErrors.price = "Vui lòng nhập giá";
      } else if (Number(values.price) <= 0) {
        newErrors.price = "Giá phải lớn hơn 0";
      }
      
      if (!values.status) {
        newErrors.status = "Vui lòng chọn trạng thái";
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      // Gửi dữ liệu
      const response = await updateRoomService(id, values);
      if (response.success) {
        showSuccess("Cập nhật dịch vụ phòng thành công");
        navigate(`/rooms/${roomService.room.id}`);
      } else {
        showError(
          response.message || "Có lỗi xảy ra khi cập nhật dịch vụ phòng"
        );
      }
    } catch (error) {
      console.error("Error updating room service:", error);
      showError("Có lỗi xảy ra khi cập nhật dịch vụ phòng");
    }
  };

  if (loadingRoomService) {
    return <Loader />;
  }

  if (!roomService) {
    return <div>Không tìm thấy dịch vụ phòng</div>;
  }

  const initialValues = {
    service_id: roomService?.service?.id || roomService?.service_id,
    price: roomService?.price || "",
    is_fixed: roomService?.is_fixed || true,
    status: roomService?.status || "active",
    description: roomService?.description || "",
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fs-4">
          Chỉnh sửa dịch vụ {roomService.service?.name} - Phòng{" "}
          {roomService.room?.room_number}
        </h3>
        <button
          onClick={() => navigate(`/rooms/${roomService.room.id}`)}
          className="btn btn-light"
        >
          Quay lại
        </button>
      </div>

      <Card>
        <RoomServiceForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitting={submitting}
          isEdit={true}
          roomService={roomService}
          errors={errors}
        />
      </Card>
    </div>
  );
};

export default RoomServiceEdit;
