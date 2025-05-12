import { useEffect, useState } from "react";
import { roomService } from "../../api/rooms";
import { userService } from "../../api/users";
import { useAuth } from "../../hooks/useAuth";
import Select from "../common/Select";
import Button from "../common/Button";
import TextArea from "../common/TextArea";
import Loader from "../common/Loader";

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
    room_id: roomId || initialData.room_id || "",
    sender_id: user?.id || initialData.sender_id || "",
    recipient_id: initialData.recipient_id || "",
    request_type: initialData.request_type || "maintenance",
    description: initialData.description || "",
    status: initialData.status || "pending",
    ...initialData,
  });

  const [rooms, setRooms] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    loadRooms();
    loadPotentialRecipients();
  }, [user?.id]);

  const loadRooms = async () => {
    try {
      const response = await roomService.getRooms({
        per_page: 100, // Load more rooms
        include: "house",
      });
      if (response.success) {
        const roomsList = response.data.data.map((room) => ({
          value: room.id,
          label: `${room.room_number} - ${room.house?.name || ""}`,
        }));
        setRooms(roomsList);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách phòng:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPotentialRecipients = async () => {
    try {
      let recipients = [];

      if (user.role === "admin") {
        // Admin có thể gửi cho admin khác, manager hoặc tenant
        const response = await userService.getUsers({
          role: "admin,manager,tenant",
          for_requests: "true"
        });
        recipients = response.data.data || [];
      } else if (user.role === "manager") {
        // Manager có thể gửi cho admin hoặc tenant từ các nhà họ quản lý
        // Sử dụng tham số for_requests để lấy được admin
        const response = await userService.getUsers({
          for_requests: "true"
        });
        
        recipients = response.data.data || [];
        console.log("Recipients from API:", recipients);
      } else if (user.role === "tenant") {
        // Tenant chỉ có thể gửi cho manager quản lý nhà của họ
        const response = await userService.getUsers({
          for_requests: "true"
        });
        
        recipients = response.data.data || [];
        console.log("Managers for tenant:", recipients);
      }

      // Lọc bỏ người dùng hiện tại
      const filteredRecipients = recipients
        .filter((r) => r.id !== user.id)
        .map((r) => ({
          value: r.id,
          label: `${r.name} (${
            r.role.code === "admin" ? "Quản trị viên" : 
            r.role.code === "manager" ? "Quản lý" : "Người thuê"
          })`,
        }));

      setRecipients(filteredRecipients);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người nhận:", error);
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

  const requestStatuses = [
    { value: "pending", label: "Đang chờ" },
    { value: "in_progress", label: "Đang xử lý" },
    { value: "completed", label: "Đã hoàn thành" },
    { value: "rejected", label: "Đã từ chối" },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-md-6">
          <Select
            label="Phòng"
            name="room_id"
            value={formData.room_id}
            onChange={handleChange}
            error={errors.room_id}
            options={[{ value: "", label: "Chọn phòng" }, ...rooms]}
            required
            disabled={!!roomId || mode === "edit"}
          />
        </div>

        <div className="col-md-6">
          <Select
            label="Người nhận"
            name="recipient_id"
            value={formData.recipient_id}
            onChange={handleChange}
            error={errors.recipient_id}
            options={[{ value: "", label: "Chọn người nhận" }, ...recipients]}
            required
          />
        </div>

        <div className="col-md-6">
          <Select
            label="Loại yêu cầu"
            name="type"
            value={formData.type}
            onChange={handleChange}
            error={errors.type}
            options={requestTypes}
            required
          />
        </div>

        {mode === "edit" && (
          <div className="col-md-6">
            <Select
              label="Trạng thái"
              name="status"
              value={formData.status}
              onChange={handleChange}
              error={errors.status}
              options={requestStatuses}
              required
            />
          </div>
        )}

        <div className="col-12">
          <TextArea
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            rows={5}
            required
          />
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
            ? "Tạo yêu cầu"
            : "Cập nhật yêu cầu"}
        </Button>
      </div>
    </form>
  );
};

export default RequestForm;
