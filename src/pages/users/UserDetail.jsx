import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { userService } from "../../api/users";
import { useContext } from "react";
import { AlertContext } from "../../contexts/AlertContext";

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
        showError("Lỗi khi tải người dùng");
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
    return <div>Loading user data...</div>;
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
          <Link
            to={`/users/${id}/edit`}
            className="btn btn-primary fw-semibold"
          >
            Sửa
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="d-flex align-items-start">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="rounded-circle object-fit-cover me-4"
              style={{ width: "4rem", height: "4rem" }}
            />
          ) : (
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-secondary fs-1 me-4 bg-light mr-3"
              style={{ width: "4rem", height: "4rem" }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-grow-1">
            <h4 className="fs-4 fw-semibold">{user.name}</h4>
            <p className="text-secondary">@{user.username}</p>

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

        <hr className="my-4" />

        <div className="row g-4">
          <div className="col-12 col-md-6">
            <h3 className="fs-5 fw-medium mb-2">Thông tin liên hệ</h3>
            <div className="d-flex flex-column gap-2">
              <div>
                <span className="text-secondary">Email: </span>
                <span className="ms-2">{user.email || "N/A"}</span>
              </div>
              <div>
                <span className="text-secondary">Số điện thoại: </span>
                <span className="ms-2">{user.phone_number || "N/A"}</span>
              </div>
              <div>
                <span className="text-secondary">Quê quán: </span>
                <span className="ms-2">{user.hometown || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <h3 className="fs-5 fw-medium mb-2">Thông tin cá nhân</h3>
            <div className="d-flex flex-column gap-2">
              <div>
                <span className="text-secondary">Số CMND/CCCD: </span>
                <span className="ms-2">{user.identity_card || "N/A"}</span>
              </div>
              <div>
                <span className="text-secondary">Biển số xe: </span>
                <span className="ms-2">{user.vehicle_plate || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="fs-5 fw-medium mb-2">Thông tin hệ thống</h3>
          <div className="d-flex flex-column gap-2">
            <div>
              <span className="text-secondary">User ID: </span>
              <span className="ms-2">{user.id}</span>
            </div>
            <div>
              <span className="text-secondary">Tạo: </span>
              <span className="ms-2">{user.created_at}</span>
            </div>
            <div>
              <span className="text-secondary">Lần cuối cập nhật: </span>
              <span className="ms-2">{user.updated_at}</span>
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
      </div>
    </div>
  );
};

export default UserDetail;
