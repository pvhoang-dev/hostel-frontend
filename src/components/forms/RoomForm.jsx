import { useEffect, useState } from "react";
import { houseService } from "../../api/houses";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import TextArea from "../ui/TextArea";

const RoomForm = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  errors = {},
  mode = "create",
  houseId = null,
}) => {
  // Use initialData.house_id if available, otherwise fall back to houseId
  const preselectedHouseId = initialData.house_id || initialData?.house?.id || houseId || "";

  const [formData, setFormData] = useState({
    house_id: preselectedHouseId.toString(),
    room_number: "",
    capacity: 1,
    base_price: 0,
    status: "available",
    description: "",
    ...initialData,
  });

  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Always load houses, even if houseId is provided
    loadHouses();
  }, []);

  const loadHouses = async () => {
    setLoading(true);
    try {
      const response = await houseService.getHouses({
        status: "active",
      });
      if (response.success) {
        if (mode === "edit") {
          setHouses(
            response.data.data.map((house) => ({
              value: house.id,
              label: `${house.name} (${house.address})`,
            }))
          );
        } else {
          setHouses(
            response.data.data.map((house) => ({
              value: house.id.toString(),
              label: `${house.name} (${house.address})`,
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error loading houses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert numerical values
    if (name === "capacity" || name === "base_price") {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
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
            label="Nhà"
            name="house_id"
            value={formData.house_id}
            onChange={handleChange}
            error={errors.house_id}
            options={[{ value: "", label: "Chọn nhà" }, ...houses]}
            placeholder="Chọn nhà"
            required
            disabled={!!houseId || loading}
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Số phòng"
            name="room_number"
            value={formData.room_number}
            onChange={handleChange}
            error={errors.room_number}
            required
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Sức chứa"
            name="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={handleChange}
            error={errors.capacity}
            required
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Giá cơ bản"
            name="base_price"
            type="number"
            min="0"
            value={formData.base_price || ""}
            onChange={handleChange}
            error={errors.base_price}
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
              { value: "available", label: "Có sẵn" },
              { value: "used", label: "Đã thuê" },
              { value: "maintain", label: "Bảo trì" },
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

export default RoomForm;
