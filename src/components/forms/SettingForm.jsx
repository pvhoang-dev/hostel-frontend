import { useState } from "react";
import Input from "../common/Input";
import Button from "../common/Button";

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
      <div className="grid grid-cols-1 gap-6">
        <Input
          label="Số thứ tự"
          name="key"
          value={formData.key}
          onChange={handleChange}
          error={errors.key}
          required
          disabled={mode === "edit"}
        />

        <Input
          label="Nội dung"
          name="value"
          value={formData.value}
          onChange={handleChange}
          error={errors.value}
          required
        />

        <div className="col-span-1">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mô tả
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description || ""}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.description && (
            <span className="text-red-500 text-sm mt-1">
              {errors.description}
            </span>
          )}
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

export default SettingForm;
