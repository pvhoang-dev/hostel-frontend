// src/pages/users/UserDetail.jsx
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Chi tiết người dùng</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate("/users")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Back
          </button>
          <Link
            to={`/users/${id}/edit`}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Chỉnh sửa
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <div className="flex items-start">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-32 h-32 rounded-full object-cover mr-6"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-4xl mr-6">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-600">@{user.username}</p>

            {user.role && (
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mt-2">
                {user.role.name}
              </span>
            )}

            {user.status && (
              <span
                className={`inline-block ${
                  user.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                } px-2 py-1 rounded text-sm mt-2 ml-2`}
              >
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            )}
          </div>
        </div>

        <hr className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Thông tin liên hệ</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2">{user.email || "Not provided"}</span>
              </div>
              <div>
                <span className="text-gray-600">Số điện thoại:</span>
                <span className="ml-2">
                  {user.phone_number || "Not provided"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Quê quán:</span>
                <span className="ml-2">{user.hometown || "Not provided"}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Thông tin cá nhân</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Số CMND/CCCD</span>
                <span className="ml-2">
                  {user.identity_card || "Not provided"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Biển số xe:</span>
                <span className="ml-2">
                  {user.vehicle_plate || "Not provided"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Thông tin hệ thống</h3>
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">User ID:</span>
              <span className="ml-2">{user.id}</span>
            </div>
            <div>
              <span className="text-gray-600">Tạo:</span>
              <span className="ml-2">{user.created_at}</span>
            </div>
            <div>
              <span className="text-gray-600">Lần cuối cập nhật:</span>
              <span className="ml-2">{user.updated_at}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => navigate(`/users/${id}/change-password`)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded mr-2"
          >
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
