// src/pages/roles/RoleCreate.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { roleService } from "../../api/roles";
import RoleForm from "../../components/forms/RoleForm";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const RoleCreate = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [errors, setErrors] = useState({});

  const { execute: createRole, loading: isSubmitting } = useApi(
    roleService.createRole
  );

  const handleSubmit = async (formData) => {
    const response = await createRole(formData);

    if (response.success) {
      showSuccess("Tạo vai trò thành công");
      navigate("/roles");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Lỗi khi tạo vai trò");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Tạo vai trò</h1>
        <button
          onClick={() => navigate("/roles")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Back
        </button>
      </div>

      <Card>
        <RoleForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="create"
        />
      </Card>
    </div>
  );
};

export default RoleCreate;
