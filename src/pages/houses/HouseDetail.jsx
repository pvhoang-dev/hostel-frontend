import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { houseService } from "../../api/houses";
import { useContext } from "react";
import { AlertContext } from "../../contexts/AlertContext";
import { useAuth } from "../../hooks/useAuth";
import RoomList from "../rooms/RoomList";
import HouseSettingList from "./settings/HouseSettingList";
import StorageList from "../storages/StorageList";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";

const HouseDetail = ({ tenantView = false }) => {
  const { id } = useParams();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin, isTenant } = useAuth();

  // Nếu được truyền vào tenantView hoặc người dùng là tenant, áp dụng chế độ xem cho tenant
  const isInTenantView = tenantView || isTenant;

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
    return <Loader />;
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
        return "bg-success";
      case "inactive":
        return "bg-danger";
      case "maintenance":
        return "bg-warning";
      default:
        return "bg-secondary";
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
          {isAdmin && !isInTenantView && (
            <Link
              to={`/houses/${id}/edit`}
              className="btn btn-primary fw-semibold"
            >
              Sửa
            </Link>
          )}
        </div>
      </div>

      <Card>
        <div className="d-flex align-items-start mb-4">
          <div className="flex-grow-1">
            <h4 className="fs-4 fw-semibold">{house.name}</h4>
            <p>Địa chỉ: {house.address}</p>

            <span
              className={`d-inline-block ${getStatusClass(
                house.status
              )} text-white px-2 py-1 rounded small mt-2`}
            >
              {getStatusText(house.status)}
            </span>
          </div>
        </div>

        <div className="row">
          {/* Hiển thị thông tin quản lý dù ở chế độ tenant hay không */}
          <div className="col-md-6 mb-4">
            <h5 className="mb-3">Thông tin quản lý</h5>
            {house.manager ? (
              <div className="d-flex align-items-center mb-3">
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
                </div>
              </div>
            ) : (
              <p className="mb-3">Chưa có quản lý</p>
            )}

            {house.manager && (
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead style={{ backgroundColor: "rgba(0, 0, 0, .075)" }}>
                    <tr>
                      <th colSpan="2">Chi tiết quản lý</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="2">
                        <Link
                          to={`/users/${house.manager.id}`}
                          className="text-primary"
                        >
                          Xem chi tiết quản lý
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="col-md-6 mb-4">
            <h5 className="mb-3">Thông tin mô tả</h5>
            <div className="p-3 border rounded">
              <p style={{ whiteSpace: "pre-wrap" }} className="mb-0">
                {house.description || "Không có mô tả"}
              </p>
            </div>
          </div>

          <div className="col-md-12 mb-4">
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
                    <td>ID nhà:</td>
                    <td>{house.id}</td>
                  </tr>
                  <tr>
                    <td>Tạo:</td>
                    <td>{house.created_at}</td>
                  </tr>
                  <tr>
                    <td>Lần cuối cập nhật:</td>
                    <td>{house.updated_at}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>

      {/* Chỉ hiển thị nội quy nhà cho tenant */}
      <hr className="my-4" />
      <div className="mt-4">
        <HouseSettingList houseId={id} embedded={true} />
      </div>

      {/* Các phần sau chỉ hiển thị khi không ở chế độ tenant */}
      {!isInTenantView && (
        <>
          <hr className="my-4" />
          <div className="mt-4">
            <RoomList houseId={id} embedded={true} fromHouseDetail={true} />
          </div>
          <hr className="my-4" />
          <div className="mt-4">
            <StorageList houseId={id} embedded={true} fromHouseDetail={true} />
          </div>
        </>
      )}
    </div>
  );
};

export default HouseDetail;
