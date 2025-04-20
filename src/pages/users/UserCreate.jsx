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
      showSuccess("User created successfully");
      navigate("/users");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Failed to create user");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Create User</h1>
        <button
          onClick={() => navigate("/users")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Back to Users
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
