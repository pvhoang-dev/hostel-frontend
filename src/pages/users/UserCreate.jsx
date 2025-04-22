import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../api/users";
import UserForm from "../../components/forms/UserForm";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const UserCreate = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [errors, setErrors] = useState({});

  const { execute: createUser, loading: isSubmitting } = useApi(
    userService.createUser
  );

  const handleSubmit = async (formData) => {
    const response = await createUser(formData);

    if (response.success) {
      showSuccess("Tạo người dùng thành công");
      navigate("/users");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Có lỗi xảy ra khi tạo người dùng");
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Tạo người dùng</h1>
        <button
          onClick={() => navigate("/users")}
          className="btn btn-light fw-semibold"
        >
          Back
        </button>
      </div>

      <Card>
        <UserForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="create"
        />
      </Card>
    </div>
  );
};

export default UserCreate;
