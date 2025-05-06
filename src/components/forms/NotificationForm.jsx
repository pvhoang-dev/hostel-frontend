import { useEffect, useState } from "react";
import { userService } from "../../api/users";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import TextArea from "../common/TextArea";
import { useAuth } from "../../hooks/useAuth";

const NotificationForm = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  errors = {},
  mode = "create",
}) => {
  const { user, isAdmin, isManager } = useAuth();

  const [formData, setFormData] = useState({
    user_id: initialData.user_id || initialData?.user?.id || "",
    type: initialData.type || "info",
    content: initialData.content || "",
    url: initialData.url || "",
    is_read: initialData.is_read || false,
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin || isManager) {
      loadUsers();
    }
  }, [isAdmin, isManager]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Admin can see all users, managers only see tenants they manage
      const params = isManager ? { managed_by: user.id, role: "tenant" } : {};

      const response = await userService.getUsers(params);
      if (response.success) {
        setUsers(
          response.data.data.map((user) => ({
            value: user.id,
            label: `${user.name} (${user.email})`,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-md-6">
          <Select
            label="Người nhận"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            error={errors.user_id}
            options={[{ value: "", label: "Chọn người nhận" }, ...users]}
            placeholder="Chọn người nhận"
            required
            disabled={loading || mode === "edit"}
          />
        </div>

        <div className="col-md-6">
          <Select
            label="Loại thông báo"
            name="type"
            value={formData.type}
            onChange={handleChange}
            error={errors.type}
            options={[
              { value: "info", label: "Thông tin" },
              { value: "warning", label: "Cảnh báo" },
              { value: "success", label: "Thành công" },
              { value: "danger", label: "Nguy hiểm" },
              { value: "request", label: "Yêu cầu" },
            ]}
          />
        </div>

        <div className="col-12">
          <TextArea
            label="Nội dung"
            name="content"
            value={formData.content}
            onChange={handleChange}
            error={errors.content}
            rows={4}
            required
          />
        </div>

        <div className="col-md-12">
          <Input
            label="URL (tùy chọn)"
            name="url"
            value={formData.url || ""}
            onChange={handleChange}
            error={errors.url}
            placeholder="Đường dẫn liên kết (nếu có)"
          />
        </div>

        <div className="col-md-12">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="is_read"
              name="is_read"
              checked={formData.is_read}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="is_read">
              Đánh dấu đã đọc
            </label>
          </div>
          {errors.is_read && (
            <div className="text-danger">{errors.is_read}</div>
          )}
        </div>
      </div>

      <div className="mt-4 d-flex justify-content-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          className=" mr-2"
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

export default NotificationForm;
