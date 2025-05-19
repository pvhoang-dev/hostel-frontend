import { useState, useEffect } from "react";
import { roomService } from "../../api/rooms";
import { paymentMethodService } from "../../api/paymentMethods";
import { formatCurrency } from "../../utils/formatters";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import TextArea from "../ui/TextArea.jsx";
import Button from "../ui/Button.jsx";
import Loader from "../ui/Loader.jsx";
import useApi from "../../hooks/useApi";
import Checkbox from "../ui/Checkbox.jsx";

const InvoiceForm = ({
  initialData = {},
  onSubmit,
  isSubmitting,
  errors = {},
  mode = "create",
  roomId,
  houseId,
}) => {
  const [formData, setFormData] = useState({
    room_id: initialData.room_id || "",
    invoice_type: mode === "create" ? "custom" : (initialData.invoice_type || "custom"),
    month: initialData.month || new Date().getMonth() + 1,
    year: initialData.year || new Date().getFullYear(),
    description: initialData.description || "",
    items: initialData.items || [
      { source_type: "manual", amount: 0, description: "" },
    ],
    deleted_service_usage_ids: [], // Để lưu danh sách service_usage_id cần xóa
    // Thêm các trường liên quan đến thanh toán
    payment_method_id: initialData.payment_method_id || 1,
    payment_status: initialData.payment_status || "pending",
    payment_date: initialData.payment_date || "",
    transaction_code: initialData.transaction_code || "",
  });

  const [rooms, setRooms] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [showPaymentSection, setShowPaymentSection] = useState(false);

  const { execute: fetchRooms } = useApi(
    roomService.getRooms
  );

  const { execute: fetchPaymentMethods } = useApi(
    paymentMethodService.getPaymentMethods
  );

  // Load rooms based on houseId (if provided)
  useEffect(() => {
    if (mode === "create") {
      loadRooms();
    }
    // Luôn tải danh sách phương thức thanh toán
    loadPaymentMethods();
    
    // Nếu là mode edit và có payment_method_id, hiển thị phần thanh toán
    if (mode === "edit" && initialData.payment_method_id) {
      setShowPaymentSection(true);
    }
  }, [houseId]);

  const loadRooms = async () => {
    setLoadingRooms(true);
    const params = {};
    if (houseId) params.house_id = houseId;

    try {
      const response = await fetchRooms({
        ...params,
        include: "currentContract",
      });
      if (response.success) {
        setRooms(response.data.data);
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setLoadingRooms(false);
    }
  };

  const loadPaymentMethods = async () => {
    setLoadingPaymentMethods(true);
    try {
      const response = await fetchPaymentMethods({});
      if (response.success) {
        setPaymentMethods(response.data.data);
      }
    } catch (error) {
      console.error("Error loading payment methods:", error);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Nếu đổi trạng thái thanh toán, xử lý ngày thanh toán tương ứng
    if (name === 'payment_status') {
      if (value !== 'completed') {
        // Nếu không phải trạng thái đã thanh toán, xóa ngày thanh toán
        setFormData((prev) => ({ 
          ...prev, 
          [name]: value,
          payment_date: ""
        }));
        return;
      } else if (value === 'completed') {
        setFormData((prev) => ({
          ...prev,
          payment_date: new Date().toISOString().split('T')[0]
        }));
      }
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    // Chỉ cho phép thay đổi các item có source_type là manual
    const updatedItems = [...formData.items];
    if (updatedItems[index].source_type === "manual") {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      setFormData((prev) => ({ ...prev, items: updatedItems }));
    }
  };

  const addItem = () => {
    // Chỉ thêm item với source_type là manual
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { source_type: "manual", amount: 0, description: "" },
      ],
    }));
  };

  const removeItem = (index) => {
    const updatedItems = [...formData.items];
    const itemToRemove = updatedItems[index];
    
    if (mode === "edit" && itemToRemove.source_type === "service_usage" && itemToRemove.service_usage_id) {
      // Lưu service_usage_id để xóa
      setFormData(prev => ({
        ...prev,
        deleted_service_usage_ids: [...prev.deleted_service_usage_ids, itemToRemove.service_usage_id]
      }));
    }
    
    updatedItems.splice(index, 1);
    
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );
  };

  const togglePaymentSection = () => {
    setShowPaymentSection(!showPaymentSection);
    
    // Nếu ẩn phần thanh toán, xóa dữ liệu thanh toán
    if (showPaymentSection) {
      setFormData((prev) => ({
        ...prev,
        payment_method_id: "",
        payment_status: "pending",
        payment_date: "",
        transaction_code: "",
      }));
    } else {
      // Nếu hiện phần thanh toán, thiết lập giá trị mặc định
      setFormData((prev) => ({
        ...prev,
        payment_method_id: prev.payment_method_id || (paymentMethods.length > 0 ? paymentMethods[0].id : ""),
        payment_status: prev.payment_status || "pending",
        payment_date: prev.payment_date || "",
        transaction_code: prev.transaction_code || "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (loadingRooms || loadingPaymentMethods && mode === "create") {
    return <Loader />;
  }

  const selectedRoom = rooms.find(
    (room) => room.id === parseInt(formData.room_id)
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        {mode === "create" && (
          <div className="col-md-6">
            <Select
              label="Phòng"
              name="room_id"
              value={formData.room_id}
              onChange={handleInputChange}
              error={errors.room_id}
              required
              options={[
                { value: "", label: "-- Chọn phòng --" },
                ...rooms.map((room) => ({
                  value: room.id,
                  label: `${room.house?.name || "Nhà"} - Phòng ${
                    room.room_number
                  }`,
                })),
              ]}
            />
          </div>
        )}

        {mode === "edit" && formData.invoice_type && (
          <div className="col-md-6">
            <Input
              label="Loại hóa đơn"
              value={formData.invoice_type === "custom" ? "Tùy chỉnh" : "Dịch vụ / Tháng"}
              disabled={true}
            />
          </div>
        )}

        <div className="col-md-6">
          <Input
            label="Tháng"
            name="month"
            type="number"
            min="1"
            max="12"
            value={formData.month}
            onChange={handleInputChange}
            error={errors.month}
            required
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Năm"
            name="year"
            type="number"
            min="2000"
            max="2100"
            value={formData.year}
            onChange={handleInputChange}
            error={errors.year}
            required
          />
        </div>

        <div className="col-12">
          <TextArea
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            error={errors.description}
            rows={2}
          />
        </div>

        {selectedRoom && (
          <div className="col-12 mb-2">
            <div className="alert alert-info">
              <strong>Thông tin phòng:</strong> {selectedRoom.house?.name} -
              Phòng {selectedRoom.room_number}
              {selectedRoom?.currentContract && (
                <span>
                  {" "}
                  - Giá thuê:{" "}
                  {formatCurrency(selectedRoom.currentContract.monthly_price)}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="col-12">
          <h4 className="fs-5 fw-semibold mb-3">Chi tiết hóa đơn</h4>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead style={{ backgroundColor: "rgba(0, 0, 0, .075)" }}>
                <tr>
                  <th style={{ width: "20%" }}>Loại</th>
                  <th style={{ width: "40%" }}>Thông tin</th>
                  <th style={{ width: "25%" }}>Số tiền</th>
                  <th style={{ width: "15%" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {formData.items &&
                  formData.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        {item.source_type === "service_usage" ? (
                          <Input
                            value="Dịch vụ"
                            disabled={true}
                            inline
                          />
                        ) : (
                          <Input
                            value="Nhập tay"
                            disabled={true}
                            inline
                          />
                        )}
                      </td>
                      <td>
                        <Input
                          name={`description-${index}`}
                          value={item.description || ""}
                          onChange={(e) =>
                            handleItemChange(index, "description", e.target.value)
                          }
                          disabled={item.source_type === "service_usage"}
                          error={
                            errors.items && errors.items[index]
                              ? errors.items[index].description
                              : ""
                          }
                          rows={2}
                          inline
                        />
                      </td>
                      <td>
                        <Input
                          name={`amount-${index}`}
                          type="number"
                          min="0"
                          value={item.amount || null}
                          onChange={(e) =>
                            handleItemChange(index, "amount", e.target.value)
                          }
                          disabled={item.source_type === "service_usage"}
                          error={
                            errors.items && errors.items[index]
                              ? errors.items[index].amount
                              : ""
                          }
                          inline
                        />
                      </td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          type="button"
                          onClick={() => removeItem(index)}
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2" className="text-end">
                    <strong>Tổng cộng:</strong>
                  </td>
                  <td>{formatCurrency(calculateTotal())}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="col-12 mb-4">
          <Button variant="primary" type="button" onClick={addItem}>
            Thêm dòng
          </Button>
        </div>

        <div className="col-12 mb-3">
          <div className="form-check form-switch">
            <Checkbox
              label="Thanh toán"
              name="is_fixed_checkbox"
              checked={showPaymentSection}
              onChange={togglePaymentSection}
            />
          </div>
        </div>

        {showPaymentSection && (
          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Thông tin thanh toán</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <Select
                      label="Phương thức thanh toán"
                      name="payment_method_id"
                      value={formData.payment_method_id}
                      onChange={handleInputChange}
                      error={errors.payment_method_id}
                      required={showPaymentSection}
                      options={[
                        { value: "", label: "-- Chọn phương thức --" },
                        ...paymentMethods.map((method) => ({
                          value: method.id,
                          label: method.name,
                        })),
                      ]}
                    />
                  </div>
                  <div className="col-md-6">
                    <Select
                      label="Trạng thái thanh toán"
                      name="payment_status"
                      value={formData.payment_status}
                      onChange={handleInputChange}
                      error={errors.payment_status}
                      required={showPaymentSection}
                      options={[
                        { value: "pending", label: "Chờ thanh toán" },
                        { value: "completed", label: "Đã thanh toán" },
                        { value: "failed", label: "Thanh toán thất bại" },
                        { value: "refunded", label: "Đã hoàn tiền" },
                      ]}
                    />
                  </div>
                  <div className="col-md-6">
                    <Input
                      label="Ngày thanh toán"
                      name="payment_date"
                      type="date"
                      value={formData.payment_date}
                      onChange={handleInputChange}
                      error={errors.payment_date}
                      required={showPaymentSection && formData.payment_status === "completed"}
                    />
                  </div>
                  <div className="col-md-6">
                    <Input
                      label="Mã giao dịch (tùy chọn)"
                      name="transaction_code"
                      value={formData.transaction_code}
                      onChange={handleInputChange}
                      error={errors.transaction_code}
                      placeholder="Hệ thống sẽ tự động tạo nếu không nhập"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="col-12 d-flex justify-content-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : mode === "create" ? "Tạo" : "Cập nhật"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default InvoiceForm;
