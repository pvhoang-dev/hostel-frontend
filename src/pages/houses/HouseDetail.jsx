import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { houseService } from "../../api/houses";
import { useContext } from "react";
import { AlertContext } from "../../contexts/AlertContext";
import { useAuth } from "../../hooks/useAuth";
import RoomList from "../rooms/RoomList";

const HouseDetail = () => {
  const { id } = useParams();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  const { showError } = useContext(AlertContext);
  const navigate = useNavigate();

  useEffect(() => {
    loadHouse();
  }, [id]);

  const loadHouse = async () => {
    setLoading(true);
    try {
      const response = await houseService.getHouse(id);
      if (response.success) {
        setHouse(response.data);
      } else {
        showError("Lỗi khi tải thông tin nhà");
        navigate("/houses");
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi tải thông tin nhà");
      console.error("Error loading house:", error);
      navigate("/houses");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading house data...</div>;
  }

  if (!house) {
    return <div>House not found</div>;
  }

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "inactive":
        return "Không hoạt động";
      case "maintenance":
        return "Bảo trì";
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "active":
        return "bg-success bg-opacity-10 text-white";
      case "inactive":
        return "bg-danger bg-opacity-10 text-white";
      case "maintenance":
        return "bg-warning bg-opacity-10 text-white";
      default:
        return "bg-secondary bg-opacity-10 text-white";
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3 className="fs-2 fw-semibold">Chi tiết nhà</h3>
        <div className="d-flex gap-2">
          <button
            onClick={() => navigate("/houses")}
            className="btn btn-light fw-semibold mr-2"
          >
            Back
          </button>
          {isAdmin && (
            <Link
              to={`/houses/${id}/edit`}
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
            <h4 className="fs-4 fw-semibold">{house.name}</h4>
            <p>Địa chỉ: {house.address}</p>

            <span
              className={`d-inline-block ${getStatusClass(
                house.status
              )} px-2 py-1 rounded small mt-2`}
            >
              {getStatusText(house.status)}
            </span>
          </div>
        </div>

        <hr className="my-4" />

        <div className="row g-4">
          <div className="col-12 col-md-6">
            <h4 className="fs-5 fw-medium mb-2">Thông tin quản lý</h4>
            {house.manager ? (
              <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center">
                  {house.manager.avatar_url ? (
                    <img
                      src={house.manager.avatar_url}
                      alt={house.manager.name}
                      className="rounded-circle object-fit-cover me-4"
                      width="40"
                      height="40"
                    />
                  ) : (
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fs-1 me-4 bg-light mr-3"
                      style={{ width: "40px", height: "40px" }}
                    >
                      {house.manager.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="fs-5 fw-semibold mb-0">
                      {house.manager.name}
                    </h4>
                    <p className="mb-0">{house.manager.email}</p>
                    {house.manager.phone_number && (
                      <p className="mb-0">SĐT: {house.manager.phone_number}</p>
                    )}
                    <div className="mt-2">
                      <Link
                        to={`/users/${house.manager.id}`}
                        className="text-primary"
                      >
                        Xem chi tiết quản lý
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p>Chưa có quản lý</p>
            )}
          </div>

          <div className="col-12 col-md-6">
            <h4 className="fs-5 fw-medium mb-2">Thông tin mô tả</h4>
            <div className="d-flex flex-column gap-2">
              <p style={{ whiteSpace: "pre-wrap" }}>
                {house.description || "Không có mô tả"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="fs-5 fw-medium mb-2">Thông tin hệ thống</h4>
          <div className="d-flex flex-column gap-2">
            <div>
              <span>ID nhà: </span>
              <span className="ms-2">{house.id}</span>
            </div>
            <div>
              <span>Tạo: </span>
              <span className="ms-2">{house.created_at}</span>
            </div>
            <div>
              <span>Lần cuối cập nhật: </span>
              <span className="ms-2">{house.updated_at}</span>
            </div>
          </div>
        </div>

        <hr className="my-4" />

        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fs-5 fw-medium mb-0">Danh sách phòng</h4>
            <Link
              to={`/rooms/create?house_id=${id}`}
              className="btn btn-primary btn-sm"
            >
              Thêm phòng mới
            </Link>
          </div>
          <RoomList houseId={id} embedded={true} fromHouseDetail={true} />
        </div>
      </div>
    </div>
  );
};

export default HouseDetail;
