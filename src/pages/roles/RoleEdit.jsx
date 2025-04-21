// src/pages/roles/RoleEdit.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { roleService } from "../../api/roles";
import RoleForm from "../../components/forms/RoleForm";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const RoleEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();

  const [roleData, setRoleData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const { execute: updateRole, loading: isSubmitting } = useApi(
    roleService.updateRole
  );
  const { execute: fetchRole } = useApi(roleService.getRole);

  useEffect(() => {
    loadRole();
  }, [id]);

  const loadRole = async () => {
    setLoading(true);
    const response = await fetchRole(id);

    if (response.success) {
      setRoleData(response.data);
    } else {
      showError("Failed to load role");
      navigate("/roles");
    }
    setLoading(false);
  };

  const handleSubmit = async (formData) => {
    const response = await updateRole(id, formData);

    if (response.success) {
      showSuccess("Role updated successfully");
      navigate("/roles");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Failed to update role");
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Edit Role</h1>
        <button
          onClick={() => navigate("/roles")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Back to Roles
        </button>
      </div>

      <Card>
        {roleData && (
          <RoleForm
            initialData={roleData}
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

export default RoleEdit;
