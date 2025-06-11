import { useEffect, useState } from "react";
import { userService } from "../../api/users";
import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/Button";
import TextArea from "../ui/TextArea";
import Loader from "../ui/Loader";
import Select from "../ui/Select";

const RequestForm = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  errors = {},
  mode = "create",
  roomId = null,
}) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    sender_id: user?.id || initialData.sender_id || "",
    recipient_id: initialData.recipient_id || "",
    request_type: initialData.request_type || "maintenance",
    description: initialData.description || "",
    status: initialData.status || "pending",
    ...initialData,
  });

  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    loadPotentialRecipients();
  }, [user?.id]);

  const loadPotentialRecipients = async () => {
    try {
      let recipients = [];

      // Thêm tham số include để lấy thêm thông tin về phòng và nhà
      if (user.role === "admin") {
        const response = await userService.getUsers({
          for_requests: "true",
          include: "house,room,role",
          per_page: 10000,
        });
        recipients = response.data.data || [];
      } else if (user.role === "manager") {
        const response = await userService.getUsers({
          for_requests: "true",
          include: "house,room,role",
          per_page: 10000,
        });
        recipients = response.data.data || [];
      } else if (user.role === "tenant") {
        const response = await userService.getUsers({
          for_requests: "true",
          include: "house,room,role",
        });
        recipients = response.data.data || [];
      }

      const filteredRecipients = recipients
        .filter((r) => r.id !== user.id)
        .map((r) => {
          let label = "";

          if (r.role.code === "admin") {
            label = `${r.name} (Quản trị viên)`;
          } else if (r.role.code === "manager") {
            label = `${r.name} (Quản lý${r.house ? ` - ${r.house.name}` : ""})`;
          } else if (r.role.code === "tenant") {
            const roomInfo = r.room
              ? ` - ${r.room.room_number}`
              : " - Chưa có phòng";
            const houseInfo = r.house ? ` - ${r.house.name}` : "";
            label = `${r.name} (Người thuê${roomInfo}${houseInfo})`;
          } else {
            label = r.name;
          }

          return {
            value: r.id,
            label: label,
          };
        });

      setRecipients(filteredRecipients);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người nhận:", error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return <Loader />;
  }

  const requestTypes = [
    { value: "maintenance", label: "Bảo trì" },
    { value: "complaint", label: "Khiếu nại" },
    { value: "inquiry", label: "Yêu cầu thông tin" },
    { value: "other", label: "Khác" },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-md-6">
          <Select
            label="Người nhận"
            name="recipient_id"
            value={formData.recipient_id}
            onChange={handleChange}
            options={recipients}
            placeholder="Chọn người nhận"
            disabled={isSubmitting}
            error={errors.recipient_id}
            required
          />
        </div>

        <div className="col-md-6">
          <Select
            label="Loại yêu cầu"
            name="request_type"
            value={formData.request_type}
            onChange={handleChange}
            options={requestTypes}
            placeholder="Chọn loại yêu cầu"
            disabled={isSubmitting}
            error={errors.request_type}
            required
          />
        </div>

        <div className="col-12">
          <TextArea
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            rows={4}
            placeholder="Nhập mô tả chi tiết về yêu cầu của bạn..."
            required
          />
        </div>

        <div className="col-12 mt-4">
          <div className="d-flex justify-content-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.history.back()}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {mode === "create" ? "Đang tạo..." : "Đang cập nhật..."}
                </>
              ) : mode === "create" ? (
                "Tạo yêu cầu"
              ) : (
                "Cập nhật yêu cầu"
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default RequestForm;
