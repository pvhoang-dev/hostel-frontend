import { useEffect, useState } from "react";
import { roomService } from "../../api/rooms";
import { userService } from "../../api/users";
import { contractService } from "../../api/contracts";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import TextArea from "../common/TextArea";
import DatePicker from "../common/DatePicker";

const ContractForm = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  errors = {},
  mode = "create",
  roomId = null,
}) => {
  console.log("ContractForm initialData:", initialData);

  const [formData, setFormData] = useState({
    room_id: roomId || initialData?.room?.id || "",
    user_ids: initialData.user_ids || [],
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 6))
      .toISOString()
      .split("T")[0],
    monthly_price: 0,
    deposit_amount: 0,
    payment_day: 5,
    status: "active",
    notes: "",
    ...initialData,
  });

  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedTenants, setSelectedTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(false);

  useEffect(() => {
    console.log("useEffect chính được gọi với initialData:", initialData);
    
    if (!roomId) {
      loadRooms();
    }
    
    // Khởi tạo giá trị khi ở chế độ edit
    if (mode === "edit" && initialData) {
      console.log("Kiểm tra tenants trong initialData:", initialData.tenants);
      console.log("Kiểm tra users trong initialData:", initialData.users);
      
      // Nếu có tenants (từ API trả về)
      if (initialData.tenants && initialData.tenants.length > 0) {
        const selectedUsers = initialData.tenants.map(tenant => ({
          value: tenant.id,
          label: `${tenant.name} (${tenant.email})`
        }));
        console.log("Khởi tạo selectedTenants từ tenants:", selectedUsers);
        setSelectedTenants(selectedUsers);
        
        // Đưa danh sách tenants vào danh sách người thuê có sẵn
        setTenants(currentTenants => {
          const newList = [...currentTenants];
          selectedUsers.forEach(user => {
            if (!newList.some(t => t.value === user.value)) {
              newList.push(user);
            }
          });
          return newList;
        });
      }
      // Nếu không có tenants nhưng có users (từ cấu trúc dữ liệu cũ)
      else if (initialData.users && initialData.users.length > 0) {
        const selectedUsers = initialData.users.map(user => ({
          value: user.id,
          label: `${user.name} (${user.email})`
        }));
        console.log("Khởi tạo selectedTenants từ users:", selectedUsers);
        setSelectedTenants(selectedUsers);
        
        // Đưa danh sách users vào danh sách người thuê có sẵn
        setTenants(currentTenants => {
          const newList = [...currentTenants];
          selectedUsers.forEach(user => {
            if (!newList.some(t => t.value === user.value)) {
              newList.push(user);
            }
          });
          return newList;
        });
      }
      
      // Nếu có room_id trong dữ liệu ban đầu, tải danh sách người thuê
      if (initialData.room_id) {
        loadTenants(initialData.room_id);
      }
    }
  }, [initialData, mode, roomId]);

  useEffect(() => {
    if (formData.room_id) {
      loadTenants(formData.room_id);
    }
  }, [formData.room_id]);

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
            label: `${room.house?.name || "N/A"} - ${room.room_number}`,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
    }
  };

  const loadTenants = async (roomId) => {
    try {
      setLoadingTenants(true);
      console.log("Đang tải danh sách người thuê cho phòng:", roomId);
      
      const params = { room_id: roomId };
      
      console.log("Params gửi đến API getAvailableTenants:", params);
      const response = await contractService.getAvailableTenants(params);
      console.log("Kết quả API getAvailableTenants:", response);
      
      if (response.success) {
        const tenantsData = response.data.map((user) => ({
          value: user.id,
          label: `${user.name} (${user.email})`,
        }));
        
        console.log("Tenants data từ API:", tenantsData);
        console.log("Selected tenants hiện tại:", selectedTenants);
                
        // Kết hợp danh sách từ API với danh sách người thuê đã chọn
        const combinedTenants = [...tenantsData];
        
        // Thêm những người thuê đã chọn vào danh sách nếu chưa có
        selectedTenants.forEach(selected => {
          if (!combinedTenants.some(t => t.value === selected.value)) {
            combinedTenants.push(selected);
          }
        });
        
        console.log("Danh sách người thuê kết hợp cuối cùng:", combinedTenants);
        setTenants(combinedTenants);
      } else {
        console.error("API getAvailableTenants không thành công:", response.message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API getAvailableTenants:", error);
    } finally {
      setLoadingTenants(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["monthly_price", "deposit_amount", "payment_day"].includes(name)) {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else if (name === "tenant_select") {
      const selectedTenant = tenants.find(tenant => tenant.value == value);
      if (selectedTenant && !selectedTenants.some(t => t.value === selectedTenant.value)) {
        const newSelectedTenants = [...selectedTenants, selectedTenant];
        setSelectedTenants(newSelectedTenants);
        setFormData({ 
          ...formData, 
          user_ids: newSelectedTenants.map(t => t.value) 
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Hàm xử lý khi chọn phòng với Select
  const handleRoomChange = (e) => {
    const roomId = e.target.value || "";
    
    setFormData(prevState => {
      const newFormData = {
        ...prevState,
        room_id: roomId,
      };
      
      // Gọi trực tiếp loadTenants nếu có room_id
      if (roomId) {
        loadTenants(roomId);
      }
      
      return newFormData;
    });
  };

  // Hàm xử lý khi chọn người thuê với Select
  const handleTenantChange = (e) => {
    const tenantId = e.target.value;
    const selectedOption = tenants.find(tenant => tenant.value === tenantId);
    
    if (selectedOption && !selectedTenants.some(t => t.value === selectedOption.value)) {
      const newSelectedTenants = [...selectedTenants, selectedOption];
      setSelectedTenants(newSelectedTenants);
      setFormData({
        ...formData,
        user_ids: newSelectedTenants.map(t => t.value)
      });
    }
  };

  const removeTenant = (tenantId) => {
    const newSelectedTenants = selectedTenants.filter(t => t.value !== tenantId);
    setSelectedTenants(newSelectedTenants);
    setFormData({ 
      ...formData, 
      user_ids: newSelectedTenants.map(t => t.value) 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        {!roomId && (
          <div className="col-md-6">
            <Select
              label="Phòng"
              name="room_id"
              value={formData.room_id}
              onChange={handleRoomChange}
              options={rooms}
              placeholder={mode === "edit" ? `${formData.room?.room_number} - ${formData.room?.house?.name}` : "Chọn phòng"}
              error={errors.room_id}
              disabled={isSubmitting || mode === "edit"}
              isClearable={mode !== "edit"}
            />
          </div>
        )}

        <div className="col-md-6">
          <Select
            label="Người thuê"
            name="tenant_select"
            onChange={handleTenantChange}
            options={tenants}
            placeholder={loadingTenants ? "Đang tải..." : "Chọn người thuê"}
            disabled={loadingTenants || isSubmitting}
            error={errors.user_ids}
            isClearable
          />
          <div className="mt-2">
            {selectedTenants.length === 0 && (
              <div className="text-muted">Chưa có người thuê nào được chọn</div>
            )}
            {selectedTenants.map(tenant => (
              <div key={tenant.value} className="d-flex align-items-center mb-1 bg-light p-2 rounded">
                <div className="flex-grow-1">{tenant.label}</div>
                <button 
                  type="button" 
                  className="btn btn-sm btn-danger" 
                  onClick={() => removeTenant(tenant.value)}
                  style={{ width: '28px', height: '28px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>×</span>
                </button>
              </div>
            ))}
          </div>
          {selectedTenants.length === 0 && mode === "create" && (
            <div className="text-danger mt-1">Vui lòng chọn ít nhất một người thuê</div>
          )}
        </div>

        <div className="col-md-6">
          <DatePicker
            label="Ngày bắt đầu"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            error={errors.start_date}
            required
          />
        </div>

        <div className="col-md-6">
          <DatePicker
            label="Ngày kết thúc"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            error={errors.end_date}
            required
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Tiền thuê hàng tháng"
            name="monthly_price"
            type="number"
            min="0"
            value={formData.monthly_price}
            onChange={handleChange}
            error={errors.monthly_price}
            required
          />
        </div>

        <div className="col-md-6">
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
        </div>

        <div className="col-md-6">
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
        </div>

        <div className="col-md-6">
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
        </div>

        <div className="col-12">
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

      <div className="mt-4 d-flex justify-content-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          className=" mr-2"
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting || selectedTenants.length === 0}>
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
