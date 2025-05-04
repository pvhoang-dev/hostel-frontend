import { useEffect, useState } from "react";
import { houseService } from "../../api/houses";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import TextArea from "../common/TextArea";
import useApi from "../../hooks/useApi";
import Loader from "../common/Loader";

const StorageForm = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  errors = {},
  mode = "create",
  houseId = null,
}) => {
  // Use initialData.house_id if available, otherwise fall back to houseId
  const preselectedHouseId = initialData.house_id || houseId || "";

  const [formData, setFormData] = useState({
    house_id: preselectedHouseId,
    equipment_id: "",
    quantity: 1,
    price: 0,
    description: "",
    ...initialData,
  });

  const [houses, setHouses] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Always load houses, even if houseId is provided
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
            value: house.id,
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

  // Hàm mô phỏng tải dữ liệu thiết bị
  // Trong thực tế, bạn cần thay đổi để gọi API thiết bị thật
  const loadEquipments = async () => {
    try {
      // Giả sử có API gọi thiết bị như equipmentService.getEquipments()
      // const response = await equipmentService.getEquipments();

      // Dữ liệu mẫu
      const mockEquipments = [
        { id: 1, name: "Tủ lạnh" },
        { id: 2, name: "Máy giặt" },
        { id: 3, name: "Điều hòa" },
        { id: 4, name: "Bàn ghế" },
        { id: 5, name: "TV" },
      ];

      setEquipments(
        mockEquipments.map((equip) => ({
          value: equip.id,
          label: equip.name,
        }))
      );
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
            disabled={!!houseId || loading}
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
            value={formData.quantity}
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
            value={formData.price}
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

export default StorageForm;
