import { useState, useEffect } from "react";
import { roomService } from "../../api/rooms";
import { serviceUsageService } from "../../api/serviceUsages";
import { formatCurrency } from "../../utils/formatters";
import Input from "../common/Input";
import Select from "../common/Select";
import TextArea from "../common/TextArea.jsx";
import Button from "../common/Button";
import Loader from "../common/Loader";
import useApi from "../../hooks/useApi";

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
  });

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const { execute: fetchRooms } = useApi(
    roomService.getRooms
  );

  // Load rooms based on houseId (if provided)
  useEffect(() => {
    if (mode === "create") {
      loadRooms();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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
    
    // Đảm bảo luôn có ít nhất một item
    if (updatedItems.length === 0) {
      updatedItems.push({ source_type: "manual", amount: 0, description: "" });
    }
    
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (loadingRooms && mode === "create") {
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
                        {item.source_type === "service_usage" ? (
                          <Input
                            value={item.description || ""}
                            disabled={true}
                            inline
                          />
                        ) : (
                          <Input
                            name={`item-${index}-description`}
                            value={item.description || ""}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            error={errors[`items.${index}.description`]}
                            placeholder="Mô tả"
                            inline
                          />
                        )}
                      </td>
                      <td>
                        <Input
                          name={`item-${index}-amount`}
                          type="number"
                          value={item.amount || 0}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "amount",
                              parseInt(e.target.value) || 0
                            )
                          }
                          error={errors[`items.${index}.amount`]}
                          min="0"
                          disabled={item.source_type === "service_usage"}
                          inline
                        />
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeItem(index)}
                          disabled={formData.items.length === 1 && item.source_type === "manual"}
                        >
                          <i className="mdi mdi-delete"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                <tr className="table-active fw-bold">
                  <td colSpan="2" className="text-end">
                    Tổng cộng:
                  </td>
                  <td colSpan="2">{formatCurrency(calculateTotal())}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <Button
            type="button"
            variant="outline-primary"
            onClick={addItem}
            className="mb-3"
          >
            <i className="mdi mdi-plus"></i> Thêm dòng
          </Button>

          {errors.items && (
            <div className="alert alert-danger">{errors.items}</div>
          )}
        </div>

        <div className="col-12 d-flex justify-content-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Đang xử lý..."
              : mode === "create"
              ? "Tạo hóa đơn"
              : "Cập nhật"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default InvoiceForm;
