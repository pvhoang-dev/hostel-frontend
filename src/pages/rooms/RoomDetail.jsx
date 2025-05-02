import { useEffect, useContext } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { roomService } from "../../api/rooms";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showError } = useAlert();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  const {
    data: room,
    loading,
    execute: fetchRoom,
  } = useApi(roomService.getRoom);

  useEffect(() => {
    loadRoom();
  }, [id]);

  const loadRoom = async () => {
    const response = await fetchRoom(id, { include: "house" });

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
        return "bg-success bg-opacity-10 text-white";
      case "occupied":
        return "bg-danger bg-opacity-10 text-white";
      case "maintenance":
        return "bg-warning bg-opacity-10 text-white";
      case "reserved":
        return "bg-info bg-opacity-10 text-white";
      default:
        return "bg-secondary bg-opacity-10 text-white";
    }
  };

  const canEdit = isAdmin || (isManager && room.house?.manager_id === user?.id);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3 className="fs-2 fw-semibold">Chi tiết phòng</h3>
        <div className="d-flex gap-2">
          <button
            onClick={() => navigate("/rooms")}
            className="btn btn-light fw-semibold mr-2"
          >
            Back
          </button>
          {canEdit && (
            <Link
              to={`/rooms/${id}/edit`}
              className="btn btn-primary fw-semibold"
            >
              Sửa
            </Link>
          )}
        </div>
      </div>

      <div className="p-4 rounded shadow">
        <div className="d-flex align-items-start">
          <div className="flex-grow-1">
            <h4 className="fs-4 fw-semibold">
              {room.room_number} - {room.house.name}
            </h4>
            <span
              className={`d-inline-block ${getStatusClass(
                room.status
              )} px-2 py-1 rounded small mt-2`}
            >
              {getStatusText(room.status)}
            </span>
          </div>
        </div>

        <hr className="my-4" />

        <div className="row g-4">
          <div className="col-12 col-md-6">
            <h4 className="fs-5 fw-medium mb-2">Thông tin cơ bản</h4>
            <div className="d-flex flex-column gap-2">
              <div>
                <span>Giá thuê: </span>
                <span className="ms-2 fw-medium">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(room.base_price || 0)}
                  /tháng
                </span>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <h4 className="fs-5 fw-medium mb-2">Thông tin bổ sung</h4>
            <div className="d-flex flex-column gap-2">
              <div>
                <span>Tiền đặt cọc: </span>
                <span className="ms-2 fw-medium">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(room.deposit || 0)}
                </span>
              </div>
              <div>
                <span>Sức chứa: </span>
                <span className="ms-2">
                  {room.capacity || "Không giới hạn"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {room.description && (
          <>
            <hr className="my-4" />
            <div>
              <h4 className="fs-5 fw-medium mb-2">Mô tả</h4>
              <p style={{ whiteSpace: "pre-wrap" }}>
                {room.description || "Không có mô tả"}
              </p>
            </div>
          </>
        )}

        {room.amenities && room.amenities.length > 0 && (
          <>
            <hr className="my-4" />
            <div>
              <h4 className="fs-5 fw-medium mb-2">Tiện ích</h4>
              <div className="d-flex flex-wrap gap-2">
                {room.amenities.map((amenity, index) => (
                  <span key={index} className="bg-light px-3 py-1 rounded-pill">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        <hr className="my-4" />

        <div>
          <h4 className="fs-5 fw-medium mb-2">Thông tin hệ thống</h4>
          <div className="d-flex flex-column gap-2">
            <div>
              <span>ID: </span>
              <span className="ms-2">{room.id}</span>
            </div>
            <div>
              <span>Tạo: </span>
              <span className="ms-2">{room.created_at}</span>
            </div>
            <div>
              <span>Lần cuối cập nhật: </span>
              <span className="ms-2">{room.updated_at}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
