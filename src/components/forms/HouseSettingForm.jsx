import { useState, useEffect } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import TextArea from "../ui/TextArea";
import Select from "../ui/Select";
import { houseService } from "../../api/houses";

const HouseSettingForm = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  errors = {},
  mode = "create",
  houseId = null,
}) => {
  const [formData, setFormData] = useState({
    house_id: houseId || "",
    key: "",
    value: "",
    description: "",
    ...initialData,
  });

  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!houseId && mode === "create") {
      loadHouses();
    }
  }, [houseId, mode]);

  const loadHouses = async () => {
    setLoading(true);
    try {
      const response = await houseService.getHouses({
        status: "active",
      });
      if (response.success) {
        setHouses(
          response.data.data.map((house) => ({
            value: house.id,
            label: house.name,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading houses:", error);
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

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        {!houseId && mode === "create" && (
          <div className="col-12">
            <Select
              label="Nhà"
              name="house_id"
              value={formData.house_id}
              onChange={handleChange}
              error={errors.house_id}
              options={[{ value: "", label: "Chọn nhà" }, ...houses]}
              required
              disabled={loading}
            />
          </div>
        )}

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

export default HouseSettingForm;
