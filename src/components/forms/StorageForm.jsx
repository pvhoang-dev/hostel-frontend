import { useEffect, useState } from "react";
import { houseService } from "../../api/houses";
import { equipmentService } from "../../api/equipments";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import TextArea from "../ui/TextArea";
import Loader from "../ui/Loader";

const StorageForm = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  errors = {},
  mode = "create",
  houseId = null,
}) => {
  // Use initialData.house_id if available, otherwise fall back to houseId
  const preselectedHouseId = initialData?.house?.id || initialData.house_id || houseId || "";

  const [formData, setFormData] = useState({
    house_id: preselectedHouseId.toString(),
    equipment_id: initialData?.equipment_id || "",
    quantity: initialData.quantity || 1,
    price: initialData.price || 0,
    description: initialData.description || "",
  });

  const [houses, setHouses] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHouses();
    loadEquipments();
  }, []);

  const loadHouses = async () => {
    setLoading(true);
    try {
      const response = await houseService.getHouses({
        status: "active",
      });
      if (response.success) {
        setHouses(
          response.data.data.map((house) => ({
            value: house.id.toString(),
            label: `${house.name} (${house.address})`,
          }))
        );
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách nhà:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadEquipments = async () => {
    try {
      const response = await equipmentService.getEquipments();
      if (response.success) {
        setEquipments(
          response.data.data.map((equipment) => ({
            value: equipment.id,
            label: equipment.name,
          }))
        );
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách thiết bị:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert numerical values
    if (name === "quantity" || name === "price") {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (loading) {
    return <Loader />;
  }

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
            disabled={!!houseId || !!initialData.house_id || loading}
          />
        </div>

        <div className="col-md-6">
          <Select
            label="Thiết bị"
            name="equipment_id"
            value={formData.equipment_id}
            onChange={handleChange}
            error={errors.equipment_id}
            options={[{ value: "", label: "Chọn thiết bị" }, ...equipments]}
            placeholder="Chọn thiết bị"
            required
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Số lượng"
            name="quantity"
            type="number"
            min="0"
            value={formData.quantity || ""}
            onChange={handleChange}
            error={errors.quantity}
            required
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Giá"
            name="price"
            type="number"
            min="0"
            value={formData.price || ""}
            onChange={handleChange}
            error={errors.price}
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

export default StorageForm;
