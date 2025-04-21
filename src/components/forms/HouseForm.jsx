import { useEffect, useState } from "react";
import { userService } from "../../api/users";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import TextArea from "../common/TextArea";

const HouseForm = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  errors = {},
  mode = "create",
}) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    manager_id: "",
    status: "active",
    description: "",
    ...initialData,
  });

  const [managers, setManagers] = useState([]);

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    try {
      const response = await userService.getUsers({
        role: "manager,admin"
      });
      if (response.success) {
        setManagers(
          response.data.data.map((user) => ({
            value: user.id,
            label: user.name,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading managers:", error);
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
          label="Tên nhà"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <Input
          label="Địa chỉ"
          name="address"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          required
        />

        <Select
          label="Quản lý"
          name="manager_id"
          value={formData.manager_id || (formData.manager?.id || "")}
          onChange={handleChange}
          error={errors.manager_id}
          options={[{value: "", label: "Chọn quản lý"}, ...managers]}
          placeholder="Chọn quản lý"
        />

        <Select
          label="Trạng thái"
          name="status"
          value={formData.status}
          onChange={handleChange}
          error={errors.status}
          options={[
            { value: "active", label: "Hoạt động" },
            { value: "inactive", label: "Không hoạt động" },
            { value: "maintenance", label: "Bảo trì" },
          ]}
        />

        <div className="md:col-span-2">
          <TextArea
            label="Mô tả"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            error={errors.description}
            rows={4}
          />
        </div>
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

export default HouseForm; 