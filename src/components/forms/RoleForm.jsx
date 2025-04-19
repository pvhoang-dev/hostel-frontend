// src/components/forms/RoleForm.jsx
import { useState, useEffect } from "react";
import Input from "../common/Input";
import Button from "../common/Button";

const RoleForm = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  errors = {},
  mode = "create",
}) => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    ...initialData,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6">
        <Input
          label="Role Code"
          name="code"
          value={formData.code}
          onChange={handleChange}
          error={errors.code}
          required
          placeholder="e.g., admin, manager, tenant"
        />

        <Input
          label="Role Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder="e.g., Admin, House Manager, Tenant"
        />
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          className="mr-2"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? `${mode === "create" ? "Creating" : "Updating"}...`
            : mode === "create"
            ? "Create Role"
            : "Update Role"}
        </Button>
      </div>
    </form>
  );
};

export default RoleForm;
