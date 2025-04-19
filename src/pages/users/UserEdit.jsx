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
      setUserData(response.data);
    } else {
      showError("Failed to load user");
      navigate("/users");
    }
    setLoading(false);
  };

  const handleSubmit = async (formData) => {
    const response = await updateUser(id, formData);

    if (response.success) {
      showSuccess("User updated successfully");
      navigate("/users");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Failed to update user");
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Edit User</h1>
        <button
          onClick={() => navigate("/users")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Back to Users
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
