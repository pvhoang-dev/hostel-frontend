import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { roomService } from "../../../api/rooms";
import { roomEquipmentService } from "../../../api/roomEquipments";
import Card from "../../../components/ui/Card";
import Loader from "../../../components/ui/Loader";
import useAlert from "../../../hooks/useAlert";
import useApi from "../../../hooks/useApi";
import { useAuth } from "../../../hooks/useAuth";

const RoomEquipmentDetail = () => {
  const { roomId, equipmentId } = useParams();
  const navigate = useNavigate();
  const { showError } = useAlert();
  const { user, isAdmin, isManager, isTenant } = useAuth();
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

  // Load room and room equipment data
  useEffect(() => {
    if (roomId) fetchRoom(roomId, { include: "house" });
    if (equipmentId) fetchRoomEquipment(equipmentId);
  }, [roomId, equipmentId]);

  // Check authorization
  useEffect(() => {
    if (!room || !roomEquipment) return;

    if (isAdmin) {
      // Admin has full access
      return;
    }

    if (isManager && room.house?.manager_id === user?.id) {
      // Manager can view equipment of houses they manage
      return;
    }

    if (isTenant) {
      // Tenant can view equipment in their rooms
      // This is a basic check - the backend does the proper verification
      // through room.contracts.tenants relationship
      return;
    }

    // No access for other users
    setIsAuthorized(false);
    showError("Bạn không có quyền xem thiết bị của phòng này");
    navigate(`/rooms/${roomId}`);
  }, [room, roomEquipment, isAdmin, isManager, isTenant, user?.id]);

  if (loadingRoom || loadingRoomEquipment) return <Loader />;
  if (!isAuthorized || !roomEquipment) return null;

  // Get the appropriate color for the source badge
  const getSourceBadgeClass = (source) => {
    return source === "storage"
      ? "bg-info text-white"
      : "bg-success text-white";
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3 className="fs-2 fw-semibold">Chi tiết thiết bị phòng</h3>
        <div className="d-flex gap-2">
          <button
            onClick={() => navigate(`/rooms/${roomId}`)}
            className="btn btn-light fw-semibold mx-2"
          >
            Quay lại
          </button>
          {(isAdmin || (isManager && room.house?.manager_id === user?.id)) && (
            <Link
              to={`/rooms/${roomId}/equipments/${equipmentId}/edit?house_id=${room?.house?.id}`}
              className="btn btn-primary fw-semibold"
            >
              Chỉnh sửa
            </Link>
          )}
        </div>
      </div>

      <Card>
        <div className="row">
          <div className="col-md-12 mb-3">
            <Link to={`/equipments/${roomEquipment.equipment?.id}`}>
              <h4 className="fs-5 fw-semibold mb-3 text-primary">
                {roomEquipment.equipment?.name}
              </h4>
            </Link>
            <div
              className={`d-inline-block ${getSourceBadgeClass(
                roomEquipment.source
              )} px-2 py-1 rounded small mb-3`}
            >
              {roomEquipment.source === "storage" ? "Từ kho" : "Tùy chỉnh"}
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
                    <td>Số lượng:</td>
                    <td>{roomEquipment.quantity}</td>
                  </tr>
                  <tr>
                    <td>Giá:</td>
                    <td className="text-primary">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(roomEquipment.price || 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <h5 className="mb-3">Thông tin khác</h5>
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
                    <td>Phòng:</td>
                    <td>
                      <Link
                        to={`/rooms/${roomEquipment.room?.id}`}
                        className="text-info"
                      >
                        {roomEquipment.room?.room_number || roomId}
                      </Link>
                    </td>
                  </tr>
                  <tr>
                    <td>Nhà:</td>
                    <td>
                      <Link
                        to={`/houses/${room?.house?.id}`}
                        className="text-info"
                      >
                        {room?.house?.name || ""}
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {roomEquipment.description && (
            <div className="col-md-12 mb-4">
              <h5 className="mb-3">Mô tả</h5>
              <div className="p-3 border rounded">
                <p style={{ whiteSpace: "pre-wrap" }} className="mb-0">
                  {roomEquipment.description}
                </p>
              </div>
            </div>
          )}

          {!isTenant && (
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
                      <td>{roomEquipment.id}</td>
                    </tr>
                    <tr>
                      <td>Tạo lúc:</td>
                      <td>{roomEquipment.created_at}</td>
                    </tr>
                    <tr>
                      <td>Cập nhật lúc:</td>
                      <td>{roomEquipment.updated_at}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default RoomEquipmentDetail;
