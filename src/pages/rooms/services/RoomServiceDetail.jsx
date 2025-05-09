import { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Card from "../../../components/common/Card";
import Loader from "../../../components/common/Loader";
import useAlert from "../../../hooks/useAlert";
import useApi from "../../../hooks/useApi";
import { roomServiceService } from "../../../api/roomServices";

const RoomServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useAlert();

  const {
    data: roomService,
    loading,
    execute: fetchRoomService,
  } = useApi(roomServiceService.getRoomService);

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

  if (loading) {
    return <Loader />;
  }

  if (!roomService) {
    return <div>Không tìm thấy dịch vụ phòng</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fs-4">
          Chi tiết dịch vụ {roomService.service?.name} - Phòng{" "}
          {roomService.room?.room_number}
        </h3>
        <div className="d-flex gap-2">
          <button
            onClick={() => navigate(`/rooms/${roomService.room.id}`)}
            className="btn btn-light mr-2"
          >
            Quay lại
          </button>
          <Link
            to={`/room-services/${id}/edit`}
            className="btn btn-primary mr-2"
          >
            Chỉnh sửa
          </Link>
          <Link
            to={`/room-services/${id}/usages`}
            className="btn btn-info text-white"
          >
            Lịch sử sử dụng
          </Link>
        </div>
      </div>

      <Card>
        <div className="row">
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
                    <td>Dịch vụ:</td>
                    <td className="text-primary font-weight-bold">
                      <Link to={`/services/${roomService.service?.id}`}>
                        {roomService.service?.name || "-"}
                      </Link>
                    </td>
                  </tr>
                  <tr>
                    <td>Giá:</td>
                    <td>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(roomService.price || 0)}
                    </td>
                  </tr>
                  <tr>
                    <td>Loại phí:</td>
                    <td>
                      {roomService.is_fixed ? (
                        <span className="text-info">Cố định</span>
                      ) : (
                        <span className="text-warning">Theo lượng sử dụng</span>
                      )}
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
                    <td>Trạng thái:</td>
                    <td>
                      {roomService.status === "active" ? (
                        <span className="text-success">Đang hoạt động</span>
                      ) : (
                        <span className="text-danger">Không hoạt động</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>Phòng:</td>
                    <td>
                      <Link
                        to={`/rooms/${roomService.room?.id}`}
                        className="text-info font-weight-bold"
                      >
                        {roomService.room?.room_number || "-"}
                      </Link>
                    </td>
                  </tr>
                  <tr>
                    <td>Nhà:</td>
                    <td>
                      <Link
                        to={`/houses/${roomService.room?.house?.id}`}
                        className="text-info font-weight-bold"
                      >
                        {roomService.room?.house?.name || "-"}
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {roomService.description && (
            <div className="col-md-12 mb-4">
              <h5 className="mb-3">Mô tả</h5>
              <div className="p-3 border rounded">
                <p style={{ whiteSpace: "pre-wrap" }} className="mb-0">
                  {roomService.description || "Không có mô tả"}
                </p>
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
                    <td>{roomService.id}</td>
                  </tr>
                  <tr>
                    <td>Tạo lúc:</td>
                    <td>{roomService.created_at}</td>
                  </tr>
                  <tr>
                    <td>Cập nhật lúc:</td>
                    <td>{roomService.updated_at}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RoomServiceDetail;
