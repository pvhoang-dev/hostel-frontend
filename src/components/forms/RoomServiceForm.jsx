import { useEffect, useState } from "react";
import Loader from "../ui/Loader";
import PropTypes from "prop-types";
import Input from "../ui/Input";
import Select from "../ui/Select";
import TextArea from "../ui/TextArea";
import Button from "../ui/Button";
import Checkbox from "../ui/Checkbox";

const RoomServiceForm = ({
  initialValues,
  onSubmit,
  submitting,
  services = [],
  isEdit = false,
  roomService = null,
  errors = {},
}) => {
  const [formData, setFormData] = useState({
    service_id: "",
    price: "",
    is_fixed: true,
    status: "active",
    description: "",
    ...initialValues,
  });

  // Update price when service changes
  useEffect(() => {
    if (formData.service_id && !isEdit) {
      const service = services.find(
        (s) => s.id === parseInt(formData.service_id)
      );
      if (service) {
        setFormData((prev) => ({
          ...prev,
          price: service.default_price || 0,
          is_fixed: !service.is_metered,
        }));
      }
    }
  }, [formData.service_id, services, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Xử lý đặc biệt cho checkbox "is_fixed_checkbox"
    if (name === "is_fixed_checkbox") {
      setFormData({
        ...formData,
        is_fixed: checked,
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Service options for dropdown
  const serviceOptions = services.map((service) => ({
    value: service.id,
    label: `${service.name} (${
      service.is_metered ? "Theo lượng sử dụng" : "Cố định"
    })`,
  }));

  // Status options
  const statusOptions = [
    { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Không hoạt động" },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        {!isEdit ? (
          <div className="col-12">
            <Select
              label="Dịch vụ"
              name="service_id"
              value={formData.service_id}
              onChange={handleChange}
              options={serviceOptions}
              error={errors.service_id}
              disabled={submitting}
              required
            />
          </div>
        ) : (
          <div className="col-12">
            <Input
              label="Dịch vụ"
              value={roomService?.service?.name || ""}
              disabled
            />
            <input
              type="hidden"
              name="service_id"
              value={formData.service_id}
            />
            <small className="text-muted">
              Không thể thay đổi loại dịch vụ. Nếu muốn thay đổi, hãy xóa và tạo
              mới.
            </small>
          </div>
        )}

        <div className="col-12">
          <Input
            type="number"
            label="Giá (VND)"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Nhập giá"
            error={errors.price}
            disabled={submitting}
            required
          />
        </div>

        <div className="col-12">
          <Checkbox
            label="Phí cố định (không tính theo lượng sử dụng)"
            name="is_fixed_checkbox"
            checked={formData.is_fixed}
            onChange={handleChange}
            error={errors.is_fixed}
            disabled={submitting}
          />
        </div>

        <div className="col-12">
          <Select
            label="Trạng thái"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
            error={errors.status}
            disabled={submitting}
            required
          />
        </div>

        <div className="col-12">
          <TextArea
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Nhập mô tả"
            error={errors.description}
            rows={3}
            disabled={submitting}
          />
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          disabled={submitting}
          className="mr-2"
        >
          Hủy
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader small light /> : "Lưu"}
        </Button>
      </div>
    </form>
  );
};

RoomServiceForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  services: PropTypes.array,
  isEdit: PropTypes.bool,
  roomService: PropTypes.object,
  errors: PropTypes.object,
};

export default RoomServiceForm;
