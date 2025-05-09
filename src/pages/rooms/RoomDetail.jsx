import { useEffect, useContext } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { roomService } from "../../api/rooms";
import Loader from "../../components/common/Loader";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import RoomEquipmentList from "./equipments/RoomEquipmentList";
import RoomServiceList from "./services/RoomServiceList";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showError } = useAlert();
  const { user, isAdmin, isManager } = useAuth();

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
        return "bg-success text-white";
      case "occupied":
        return "bg-danger text-white";
      case "maintenance":
        return "bg-warning text-white";
      case "reserved":
        return "bg-info text-white";
      default:
        return "bg-secondary text-white";
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
            className="btn btn-light fw-semibold mx-2"
          >
            Quay lại
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

      <Card>
        <div className="row">
          <div className="col-md-12 mb-3">
            <h4 className="fs-5 fw-semibold mb-3 text-primary">
              {room.room_number} - {room.house.name}
            </h4>
            <div
              className={`d-inline-block ${getStatusClass(
                room.status
              )} px-2 py-1 rounded small mb-3`}
            >
              {getStatusText(room.status)}
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <h5 className="mb-3">Thông tin cơ bản</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead style={{ backgroundColor: "rgba(0, 0, 0, .075)" }}>
                  <tr>
                    <th style={{ width: "40%" }}>Thông tin</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Giá thuê:</td>
                    <td className="text-primary">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(room.base_price || 0)}
                      /tháng
                    </td>
                  </tr>
                  <tr>
                    <td>Sức chứa:</td>
                    <td>{room.capacity || "Không giới hạn"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <h5 className="mb-3">Thông tin bổ sung</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead style={{ backgroundColor: "rgba(0, 0, 0, .075)" }}>
                  <tr>
                    <th style={{ width: "40%" }}>Thông tin</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Tiền đặt cọc:</td>
                    <td className="text-primary">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(room.deposit || 0)}
                    </td>
                  </tr>
                  <tr>
                    <td>Nhà:</td>
                    <td>
                      <Link
                        to={`/houses/${room.house?.id}`}
                        className="text-info"
                      >
                        {room.house?.name || ""}
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {room.description && (
            <div className="col-md-12 mb-4">
              <h5 className="mb-3">Mô tả</h5>
              <div className="p-3 border rounded">
                <p style={{ whiteSpace: "pre-wrap" }} className="mb-0">
                  {room.description || "Không có mô tả"}
                </p>
              </div>
            </div>
          )}

          {room.amenities && room.amenities.length > 0 && (
            <div className="col-md-12 mb-4">
              <h5 className="mb-3">Tiện ích</h5>
              <div className="d-flex flex-wrap gap-2">
                {room.amenities.map((amenity, index) => (
                  <span key={index} className="bg-light px-3 py-1 rounded-pill">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="col-md-12">
            <h5 className="mb-3">Thông tin hệ thống</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead style={{ backgroundColor: "rgba(0, 0, 0, .075)" }}>
                  <tr>
                    <th style={{ width: "200px" }}>Thông tin</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ID:</td>
                    <td>{room.id}</td>
                  </tr>
                  <tr>
                    <td>Tạo lúc:</td>
                    <td>{room.created_at}</td>
                  </tr>
                  <tr>
                    <td>Cập nhật lúc:</td>
                    <td>{room.updated_at}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
      
      <hr className="my-4" />
      <div className="mt-4">
        <RoomServiceList roomId={id} houseId={room.house?.id} embedded={true} />
      </div>

      <hr className="my-4" />
      <div className="mt-4">
        <RoomEquipmentList roomId={id} houseId={room.house?.id} />
      </div>
    </div>
  );
};

export default RoomDetail;
