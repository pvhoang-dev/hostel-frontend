import { useEffect, useState } from "react";
import { roomService } from "../../api/rooms";
import { userService } from "../../api/users";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import TextArea from "../common/TextArea";
import DatePicker from "../common/DatePicker";
import {USER_ROLES} from "../../utils/constants.js";
const ContractForm = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  errors = {},
  mode = "create",
  roomId = null,
}) => {
  const [formData, setFormData] = useState({
    room_id: roomId || "",
    tenant_id: "",
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
    monthly_rent: 0,
    deposit_amount: 0,
    payment_day: 5,
    status: "active",
    notes: "",
    ...initialData,
  });

  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    loadTenants();
    if (!roomId) {
      loadRooms();
    }
  }, [roomId]);

  const loadRooms = async () => {
    try {
      const response = await roomService.getRooms({
        status: "available",
        include: "house",
      });
      if (response.success) {
        setRooms(
          response.data.data.map((room) => ({
            value: room.id,
            label: `${room.house?.name || 'N/A'} - ${room.room_number}`,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
    }
  };

  const loadTenants = async () => {
    try {
      const response = await userService.getUsers({
        role_id: USER_ROLES.TENANT,
      });
      if (response.success) {
        setTenants(
          response.data.data.map((user) => ({
            value: user.id,
            label: `${user.name} (${user.email})`,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading tenants:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numerical values
    if (["monthly_rent", "deposit_amount", "payment_day"].includes(name)) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!roomId && (
          <Select
            label="Phòng"
            name="room_id"
            value={formData.room_id}
            onChange={handleChange}
            error={errors.room_id}
            options={[{value: "", label: "Chọn phòng"}, ...rooms]}
            placeholder="Chọn phòng"
            required
          />
        )}

        <Select
          label="Người thuê"
          name="tenant_id"
          value={formData.tenant_id}
          onChange={handleChange}
          error={errors.tenant_id}
          options={[{value: "", label: "Chọn người thuê"}, ...tenants]}
          placeholder="Chọn người thuê"
          required
        />

        <DatePicker
          label="Ngày bắt đầu"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          error={errors.start_date}
          required
        />

        <DatePicker
          label="Ngày kết thúc"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
          error={errors.end_date}
          required
        />

        <Input
          label="Tiền thuê hàng tháng"
          name="monthly_rent"
          type="number"
          min="0"
          value={formData.monthly_rent}
          onChange={handleChange}
          error={errors.monthly_rent}
          required
        />

        <Input
          label="Tiền đặt cọc"
          name="deposit_amount"
          type="number"
          min="0"
          value={formData.deposit_amount}
          onChange={handleChange}
          error={errors.deposit_amount}
          required
        />

        <Input
          label="Ngày thanh toán (hàng tháng)"
          name="payment_day"
          type="number"
          min="1"
          max="31"
          value={formData.payment_day}
          onChange={handleChange}
          error={errors.payment_day}
          required
        />

        <Select
          label="Trạng thái"
          name="status"
          value={formData.status}
          onChange={handleChange}
          error={errors.status}
          options={[
            { value: "active", label: "Đang hoạt động" },
            { value: "pending", label: "Chờ duyệt" },
            { value: "terminated", label: "Đã chấm dứt" },
            { value: "expired", label: "Đã hết hạn" },
          ]}
        />

        <div className="md:col-span-2">
          <TextArea
            label="Ghi chú"
            name="notes"
            value={formData.notes || ""}
            onChange={handleChange}
            error={errors.notes}
            rows={4}
          />
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

export default ContractForm; 
