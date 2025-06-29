import { useState } from "react";
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import TextArea from "../ui/TextArea.jsx";

const SettingForm = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  errors = {},
  mode = "create",
}) => {
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    description: "",
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
        <div className="col-12">
          <Input
            label="Số thứ tự"
            name="key"
            value={formData.key}
            onChange={handleChange}
            error={errors.key}
            required
            disabled={mode === "edit"}
          />
        </div>

        <div className="col-12">
          <Input
            label="Nội dung"
            name="value"
            value={formData.value}
            onChange={handleChange}
            error={errors.value}
            required
          />
        </div>

        <div className="col-12">
          <TextArea
            label="Mô tả"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            rows={4}
            error={errors.description}
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
            ? "Tạo"
            : "Cập nhật"}
        </Button>
      </div>
    </form>
  );
};

export default SettingForm;
