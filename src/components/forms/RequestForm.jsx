import { useEffect, useState } from "react";
import { roomService } from "../../api/rooms";
import { userService } from "../../api/users";
import { useAuth } from "../../hooks/useAuth";
import Select from "../common/Select";
import Button from "../common/Button";
import TextArea from "../common/TextArea";
import Loader from "../common/Loader";
import ReactSelect from "react-select";

// Custom styles cho ReactSelect trong dark mode
const darkModeSelectStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    backgroundColor: '#404954',
    borderColor: state.isFocused ? '#6c757d' : '#555',
    boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(130, 138, 145, 0.5)' : null,
    '&:hover': {
      borderColor: '#6c757d'
    },
    color: 'white'
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: '#404954',
  }),
  option: (baseStyles, state) => ({
    ...baseStyles,
    backgroundColor: state.isSelected ? '#0d6efd' : 
                     state.isFocused ? '#495057' : '#404954',
    color: 'white',
    '&:hover': {
      backgroundColor: '#495057',
    }
  }),
  singleValue: (baseStyles) => ({
    ...baseStyles,
    color: 'white',
  }),
  input: (baseStyles) => ({
    ...baseStyles,
    color: 'white',
  }),
  placeholder: (baseStyles) => ({
    ...baseStyles,
    color: '#adb5bd',
  }),
  loadingMessage: (baseStyles) => ({
    ...baseStyles,
    color: 'white',
  }),
  noOptionsMessage: (baseStyles) => ({
    ...baseStyles,
    color: 'white',
  }),
};

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
          include: "house,room,role"
        });
        recipients = response.data.data || [];
      } else if (user.role === "manager") {
        const response = await userService.getUsers({
          for_requests: "true",
          include: "house,room,role"
        });
        recipients = response.data.data || [];
      } else if (user.role === "tenant") {
        const response = await userService.getUsers({
          for_requests: "true",
          include: "house,room,role"
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
            const roomInfo = r.room ? ` - ${r.room.room_number}` : " - Chưa có phòng";
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

  // Xử lý change cho ReactSelect
  const handleSelectChange = (selectedOption, { name }) => {
    setFormData({ ...formData, [name]: selectedOption ? selectedOption.value : "" });
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
          <div className="form-group mb-3">
            <label htmlFor="recipient_id" className="form-label">
              Người nhận <span className="text-danger">*</span>
            </label>
            <ReactSelect
              id="recipient_id"
              name="recipient_id"
              value={recipients.find(option => option.value === formData.recipient_id) || null}
              onChange={(option) => handleSelectChange(option, { name: "recipient_id" })}
              options={recipients}
              placeholder="Chọn người nhận"
              isSearchable
              isDisabled={isSubmitting}
              className="basic-single"
              classNamePrefix="select"
              styles={darkModeSelectStyles}
            />
            {errors.recipient_id && (
              <div className="text-danger mt-1">{errors.recipient_id}</div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-group mb-3">
            <label htmlFor="request_type" className="form-label">
              Loại yêu cầu <span className="text-danger">*</span>
            </label>
            <ReactSelect
              id="request_type"
              name="request_type"
              value={requestTypes.find(option => option.value === formData.request_type) || null}
              onChange={(option) => handleSelectChange(option, { name: "request_type" })}
              options={requestTypes}
              placeholder="Chọn loại yêu cầu"
              isSearchable
              isDisabled={isSubmitting}
              className="basic-single"
              classNamePrefix="select"
              styles={darkModeSelectStyles}
            />
            {errors.request_type && (
              <div className="text-danger mt-1">{errors.request_type}</div>
            )}
          </div>
        </div>

        {mode === "edit" && (
          <div className="col-md-6">
            <div className="form-group mb-3">
              <label htmlFor="status" className="form-label">
                Trạng thái
              </label>
              <ReactSelect
                id="status"
                name="status"
                value={requestStatuses.find(option => option.value === formData.status) || null}
                onChange={(option) => handleSelectChange(option, { name: "status" })}
                options={requestStatuses}
                placeholder="Chọn trạng thái"
                isSearchable
                isDisabled={isSubmitting}
                className="basic-single"
                classNamePrefix="select"
                styles={darkModeSelectStyles}
              />
              {errors.status && (
                <div className="text-danger mt-1">{errors.status}</div>
              )}
            </div>
          </div>
        )}

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
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {mode === "create" ? "Đang tạo..." : "Đang cập nhật..."}
                </>
              ) : (
                mode === "create" ? "Tạo yêu cầu" : "Cập nhật yêu cầu"
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default RequestForm;
