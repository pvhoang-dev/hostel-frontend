import { useState } from "react";
import Input from "../common/Input";
import Button from "../common/Button";
import TextArea from "../common/TextArea";
import Checkbox from "../common/Checkbox";

const ServiceForm = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  errors = {},
  mode = "create",
}) => {
  const [formData, setFormData] = useState({
    name: "",
    default_price: "",
    unit: "",
    is_metered: false,
    description: "",
    ...initialData,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-md-6">
          <Input
            label="Tên dịch vụ"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Giá mặc định"
            name="default_price"
            type="number"
            value={formData.default_price}
            onChange={handleChange}
            error={errors.default_price}
            required
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Đơn vị"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            error={errors.unit}
            required
          />
        </div>

        <div className="col-12">
          <Checkbox
            label="Được đo? (e.g., Điện, Nước)"
            name="is_metered"
            checked={formData.is_metered}
            onChange={handleChange}
            error={errors.is_metered}
          />
        </div>

        <div className="col-12">
          <TextArea
            label="Mô tả"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            error={errors.description}
            rows={3}
          />
        </div>
      </div>

      <div className="mt-4 d-flex justify-content-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          className="me-2"
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

export default ServiceForm;
