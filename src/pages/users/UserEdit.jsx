import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { userService } from "../../api/users";
import UserForm from "../../components/forms/UserForm";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
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

      if (user.role && user.role.id) {
        user.role_id = user.role.id;
      }

      setUserData(user);
    } else {
      showError("Lỗi khi tải người dùng");
      navigate("/users");
    }
    setLoading(false);
  };

  const handleSubmit = async (formData) => {
    const dataToSubmit = { ...formData };

    if (dataToSubmit.role_id === "") {
      dataToSubmit.role_id = null;
    }

    const response = await updateUser(id, dataToSubmit);

    if (response.success) {
      showSuccess("Cập nhật người dùng thành công");
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
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Chỉnh sửa người dùng</h1>
        <button
          onClick={() => navigate("/users")}
          className="btn btn-light fw-semibold"
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
