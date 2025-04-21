// src/pages/users/UserEdit.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { userService } from "../../api/users";
import UserForm from "../../components/forms/UserForm";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();

  const [userData, setUserData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const { execute: updateUser, loading: isSubmitting } = useApi(
    userService.updateUser
  );
  const { execute: fetchUser } = useApi(userService.getUser);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    setLoading(true);
    const response = await fetchUser(id);

    if (response.success) {
      const user = response.data;

      if (user.role?.id) {
        user.role.id = String(user.role?.id);
      }

      setUserData(user);
    } else {
      showError("Lỗi khi tải người dùng");
      navigate("/users");
    }
    setLoading(false);
  };

  const handleSubmit = async (formData) => {
    // Đảm bảo role_id không phải là string rỗng khi gửi lên server
    const dataToSubmit = { ...formData };

    if (dataToSubmit.role_id === "") {
      dataToSubmit.role_id = null;
    }

    const response = await updateUser(id, dataToSubmit);

    if (response.success) {
      showSuccess("Cập nhật người dùng thành công");
      navigate("/users");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Có lỗi xảy ra khi cập nhật người dùng");
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Chỉnh sửa người dùng</h1>
        <button
          onClick={() => navigate("/users")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Back
        </button>
      </div>

      <Card>
        {userData && (
          <UserForm
            initialData={userData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            errors={errors}
            mode="edit"
          />
        )}
      </Card>
    </div>
  );
};

export default UserEdit;
