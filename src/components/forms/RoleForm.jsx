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
          label="Mã vai trò"
          name="code"
          value={formData.code}
          onChange={handleChange}
          error={errors.code}
          required
        />

        <Input
          label="Tên vai trò"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          className="mr-2"
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? `${mode === "create" ? "Đang tạo" : "Đang cập nhật"}...`
            : mode === "create"
            ? "Tạo"
            : "Cập nhật"}
        </Button>
      </div>
    </form>
  );
};

export default RoleForm;
