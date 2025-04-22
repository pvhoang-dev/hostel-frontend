import { useState } from "react";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import TextArea from "../common/TextArea";

const PaymentMethodForm = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  errors = {},
  mode = "create",
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
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
      <div className="row g-3">
        <div className="col-md-6">
          <Input
            label="Tên phương thức"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
        </div>

        <div className="col-md-6">
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
        </div>

        <div className="col-12">
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

      <div className="mt-4 d-flex justify-content-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          className="me-2 mr-2"
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

export default PaymentMethodForm;
