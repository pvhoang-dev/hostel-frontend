// src/components/forms/UserForm.jsx
import { useEffect, useState } from "react";
import { roleService } from "../../api/roles";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";

const UserForm = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  errors = {},
  mode = "create",
}) => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone_number: "",
    hometown: "",
    identity_card: "",
    vehicle_plate: "",
    status: "active",
    role_id: "",
    avatar_url: "",
    ...initialData,
  });

  const [roles, setRoles] = useState([]);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await roleService.getRoles();
      if (response.success) {
        setRoles(
          response.data.data.map((role) => ({
            value: role.id,
            label: role.name,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading roles:", error);
    }
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          required
        />

        <Input
          label="Tên người dùng"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        {mode === "create" && (
          <>
            <Input
              label="Mật khẩu"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required={mode === "create"}
            />

            <Input
              label="Xác nhận mật khẩu"
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              error={errors.password_confirmation}
              required={mode === "create"}
            />
          </>
        )}

        <Input
          label="Số điện thoại"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          error={errors.phone_number}
        />

        <Input
          label="Quê quán"
          name="hometown"
          value={formData.hometown}
          onChange={handleChange}
          error={errors.hometown}
        />

        <Input
          label="Số CMND/CCCD"
          name="identity_card"
          value={formData.identity_card}
          onChange={handleChange}
          error={errors.identity_card}
        />

        <Input
          label="Biển số xe"
          name="vehicle_plate"
          value={formData.vehicle_plate}
          onChange={handleChange}
          error={errors.vehicle_plate}
        />

        <Select
          label="Trạng thái"
          name="status"
          value={formData.status}
          onChange={handleChange}
          error={errors.status}
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />

        <Select
          label="Vai trò"
          name="role_id"
          value={formData.role?.id}
          onChange={handleChange}
          error={errors.role_id}
          options={[{value: "", label: "No role"}, ...roles]}
          placeholder="Select a Role"
        />

        <Input
          label="Avatar URL"
          name="avatar_url"
          value={formData.avatar_url}
          onChange={handleChange}
          error={errors.avatar_url}
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

export default UserForm;
