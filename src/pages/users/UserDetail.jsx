import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { userService } from "../../api/users";
import { useContext } from "react";
import { AlertContext } from "../../contexts/AlertContext";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isTenant } = useAuth();
  const { showError } = useContext(AlertContext);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const response = await userService.getUser(id);
      if (response.success) {
        setUser(response.data);
      } else {
        showError(response.message || "Có lỗi xảy ra khi xóa người dùng");
        navigate("/users");
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi tải người dùng");
      console.error("Error loading user:", error);
      navigate("/users");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3 className="fs-2 fw-semibold">Chi tiết người dùng</h3>
        <div className="d-flex gap-2">
          <button
            onClick={() => navigate("/users")}
            className="btn btn-light fw-semibold mr-2"
          >
            Back
          </button>
          {!isTenant && (
            <Link
              to={`/users/${id}/edit`}
              className="btn btn-primary fw-semibold"
            >
              Sửa
            </Link>
          )}
        </div>
      </div>

      <Card>
        <div className="d-flex align-items-start mb-4">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="rounded-circle object-fit-cover me-4"
              style={{ width: "4rem", height: "4rem" }}
            />
          ) : (
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fs-1 me-4 bg-light mr-3"
              style={{ width: "4rem", height: "4rem" }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-grow-1">
            <h4 className="fs-4 fw-semibold">{user.name}</h4>
            <p>@{user.username}</p>

            {user.role && (
              <span className="d-inline-block bg-primary bg-opacity-10 text-white px-2 py-1 rounded small mt-2 mr-2">
                {user.role.name}
              </span>
            )}

            {user.status && (
              <span
                className={`d-inline-block ${
                  user.status === "active"
                    ? "bg-success bg-opacity-10 text-white"
                    : "bg-danger bg-opacity-10 text-white"
                } px-2 py-1 rounded small mt-2 ms-2`}
              >
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <h5 className="mb-3">Thông tin liên hệ</h5>
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
                    <td>Email:</td>
                    <td>{user.email || "N/A"}</td>
                  </tr>
                  <tr>
                    <td>Số điện thoại:</td>
                    <td>{user.phone_number || "N/A"}</td>
                  </tr>
                  <tr>
                    <td>Quê quán:</td>
                    <td>{user.hometown || "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <h5 className="mb-3">Thông tin cá nhân</h5>
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
                    <td>Số CMND/CCCD:</td>
                    <td>{user.identity_card || "N/A"}</td>
                  </tr>
                  <tr>
                    <td>Biển số xe:</td>
                    <td>{user.vehicle_plate || "N/A"}</td>
                  </tr>
                </tbody>
              </table>
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
                    <td>User ID:</td>
                    <td>{user.id}</td>
                  </tr>
                  <tr>
                    <td>Tạo:</td>
                    <td>{user.created_at}</td>
                  </tr>
                  <tr>
                    <td>Lần cuối cập nhật:</td>
                    <td>{user.updated_at}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-4 d-flex justify-content-end">
          <button
            onClick={() => navigate(`/users/${id}/change-password`)}
            className="btn btn-warning text-white fw-semibold"
          >
            Đổi mật khẩu
          </button>
        </div>
      </Card>
    </div>
  );
};

export default UserDetail;
