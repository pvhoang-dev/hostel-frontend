import { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { roomService } from "../../api/rooms";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useAlert();

  const {
    data: room,
    loading,
    execute: fetchRoom,
  } = useApi(roomService.getRoom);

  useEffect(() => {
    loadRoom();
  }, [id]);

  const loadRoom = async () => {
    const response = await fetchRoom(id);

    if (!response.success) {
      showError("Lỗi khi tải thông tin phòng");
      navigate("/rooms");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!room) {
    return <div>Room not found</div>;
  }

  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "Trống";
      case "occupied":
        return "Đã thuê";
      case "maintenance":
        return "Bảo trì";
      case "reserved":
        return "Đã đặt trước";
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "available":
        return "bg-success bg-opacity-10 text-success";
      case "occupied":
        return "bg-danger bg-opacity-10 text-danger";
      case "maintenance":
        return "bg-warning bg-opacity-10 text-warning";
      case "reserved":
        return "bg-info bg-opacity-10 text-info";
      default:
        return "bg-secondary bg-opacity-10 text-secondary";
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Chi tiết phòng</h1>
        <div className="d-flex gap-2">
          <button
            onClick={() => navigate("/rooms")}
            className="btn btn-light fw-semibold mr-2"
          >
            Back
          </button>
          <Link
            to={`/rooms/${id}/edit`}
            className="btn btn-primary fw-semibold"
          >
            Sửa
          </Link>
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="fs-4 fw-semibold mb-0">{room.name}</h2>
            <span
              className={`d-inline-block ${getStatusClass(
                room.status
              )} px-2 py-1 rounded small`}
            >
              {getStatusText(room.status)}
            </span>
          </div>
          {room.house && (
            <p className="text-secondary mt-2">Thuộc nhà: {room.house.name}</p>
          )}
        </div>

        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div className="d-flex flex-column gap-2">
              <div>
                <span className="text-secondary">Loại phòng:</span>
                <span className="ms-2 fw-medium">{room.room_type}</span>
              </div>
              <div>
                <span className="text-secondary">Giá thuê:</span>
                <span className="ms-2 fw-medium">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(room.price || 0)}
                  /tháng
                </span>
              </div>
              <div>
                <span className="text-secondary">Diện tích:</span>
                <span className="ms-2">
                  {room.area} m<sup>2</sup>
                </span>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="d-flex flex-column gap-2">
              <div>
                <span className="text-secondary">Tiền đặt cọc:</span>
                <span className="ms-2 fw-medium">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(room.deposit || 0)}
                </span>
              </div>
              <div>
                <span className="text-secondary">Số người tối đa:</span>
                <span className="ms-2">
                  {room.max_occupants || "Không giới hạn"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {room.description && (
          <div className="mt-4">
            <h3 className="fs-5 fw-medium mb-2">Mô tả</h3>
            <p style={{ whiteSpace: "pre-wrap" }} className="text-secondary">
              {room.description}
            </p>
          </div>
        )}

        {room.amenities && room.amenities.length > 0 && (
          <div className="mt-4">
            <h3 className="fs-5 fw-medium mb-2">Tiện ích</h3>
            <div className="d-flex flex-wrap gap-2">
              {room.amenities.map((amenity, index) => (
                <span key={index} className="bg-light px-3 py-1 rounded-pill">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <h3 className="fs-5 fw-medium mb-2">Thông tin hệ thống</h3>
          <div className="d-flex flex-column gap-2">
            <div>
              <span className="text-secondary">ID:</span>
              <span className="ms-2">{room.id}</span>
            </div>
            <div>
              <span className="text-secondary">Tạo:</span>
              <span className="ms-2">{room.created_at}</span>
            </div>
            <div>
              <span className="text-secondary">Lần cuối cập nhật:</span>
              <span className="ms-2">{room.updated_at}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RoomDetail;
