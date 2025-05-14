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
    invoice_type: initialData.invoice_type || "custom",
    month: initialData.month || new Date().getMonth() + 1,
    year: initialData.year || new Date().getFullYear(),
    description: initialData.description || "",
    items: initialData.items || [
      { source_type: "manual", amount: 0, description: "" },
    ],
  });

  const [rooms, setRooms] = useState([]);
  const [serviceUsages, setServiceUsages] = useState([]);
  const [loadingServiceUsages, setLoadingServiceUsages] = useState(false);
  const [duplicateInvoiceWarning, setDuplicateInvoiceWarning] = useState(false);

  const { execute: fetchRooms, loading: loadingRooms } = useApi(
    roomService.getRooms
  );
  const { execute: fetchServiceUsages } = useApi(
    serviceUsageService.getServiceUsages
  );

  // Load rooms based on houseId (if provided)
  useEffect(() => {
    if (mode === "create") {
      loadRooms();
    }
  }, [houseId]);

  // Load service usages when room_id, month, and year are selected
  useEffect(() => {
    if (formData.room_id && formData.month && formData.year) {
      loadServiceUsages();
    }
  }, [formData.room_id, formData.month, formData.year]);

  const loadRooms = async () => {
    const params = {};
    if (houseId) params.house_id = houseId;

    const response = await fetchRooms({
      ...params,
      include: "currentContract",
    });
    if (response.success) {
      setRooms(response.data.data);
    }
  };

  const loadServiceUsages = async () => {
    setLoadingServiceUsages(true);
    try {
      const response = await fetchServiceUsages({
        room_id: formData.room_id,
        month: formData.month,
        year: formData.year,
        include:
          "roomService.service,roomService.room,roomService.room.house,roomService",
      });

      if (response.success) {
        setServiceUsages(response.data.data);
      }
    } catch (error) {
      console.error("Error loading service usages:", error);
    } finally {
      setLoadingServiceUsages(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Nếu thay đổi loại hóa đơn, kiểm tra warning
    if (name === 'invoice_type') {
      if (value === 'service_usage') {
        setDuplicateInvoiceWarning(true);
      } else {
        setDuplicateInvoiceWarning(false);
      }
    }
    
    // Nếu thay đổi phòng, tháng, năm và loại hóa đơn là service_usage, cập nhật warning
    if ((name === 'room_id' || name === 'month' || name === 'year') && formData.invoice_type === 'service_usage') {
      setDuplicateInvoiceWarning(true);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    if (field === "source_type") {
      // When changing source type, reset all related fields
      if (value === "manual") {
        updatedItems[index] = {
          ...updatedItems[index],
          source_type: value,
          service_usage_id: null, // Clear service usage id
          description: "", // Reset description
          amount: 0, // Reset amount
        };
      } else if (value === "service_usage") {
        updatedItems[index] = {
          ...updatedItems[index],
          source_type: value,
          service_usage_id: null, // Clear any previous selection
          description: "", // Will be filled when service is selected
          amount: 0, // Will be calculated when service is selected
        };
      }
    } else {
      // Normal field update for other fields
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    }

    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleServiceUsageSelect = (index, serviceUsageId) => {
    const serviceUsage = serviceUsages.find(
      (su) => su.id === parseInt(serviceUsageId)
    );
    if (serviceUsage) {
      // Calculate amount based on price_used and usage_value
      const amount = serviceUsage.price_used * serviceUsage.usage_value;

      const updatedItems = [...formData.items];
      updatedItems[index] = {
        ...updatedItems[index],
        service_usage_id: serviceUsage.id,
        amount,
        description: `${serviceUsage.room_service.service.name} - ${
          serviceUsage.usage_value
        } ${serviceUsage.room_service.service.unit} x ${formatCurrency(
          serviceUsage.price_used
        )}`,
      };

      setFormData((prev) => ({ ...prev, items: updatedItems }));
    }
  };

  const addItem = () => {
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
    updatedItems.splice(index, 1);
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

        <div className="col-md-6">
          <Select
            label="Loại hóa đơn"
            name="invoice_type"
            value={formData.invoice_type}
            onChange={handleInputChange}
            error={errors.invoice_type || errors.invoice}
            required
            options={[
              { value: "custom", label: "Tùy chỉnh" },
              { value: "service_usage", label: "Dịch vụ / Tháng" },
            ]}
          />
        </div>

        {duplicateInvoiceWarning && formData.invoice_type === "service_usage" && (
          <div className="col-12">
            <div className="alert alert-warning">
              <strong>Lưu ý:</strong> Chỉ có thể tạo một hóa đơn loại "Dịch vụ / Tháng" cho mỗi phòng trong một tháng. 
              Nếu đã tồn tại hóa đơn dịch vụ cho phòng và tháng này, việc tạo sẽ thất bại. 
              Trong trường hợp đó, hãy sử dụng loại hóa đơn "Tùy chỉnh".
            </div>
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
                        <Select
                          name={`item-${index}-source_type`}
                          value={item.source_type}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "source_type",
                              e.target.value
                            )
                          }
                          error={errors[`items.${index}.source_type`]}
                          options={[
                            { value: "manual", label: "Nhập tay" },
                            { value: "service_usage", label: "Dịch vụ" },
                          ]}
                          inline
                        />
                      </td>
                      <td>
                        {item.source_type === "service_usage" ? (
                          <Select
                            name={`item-${index}-service_usage_id`}
                            value={item.service_usage_id || ""}
                            onChange={(e) =>
                              handleServiceUsageSelect(index, e.target.value)
                            }
                            error={errors[`items.${index}.service_usage_id`]}
                            options={[
                              {
                                value: "",
                                label: loadingServiceUsages
                                  ? "Đang tải..."
                                  : "-- Chọn dịch vụ --",
                              },
                              ...serviceUsages.map((su) => ({
                                value: su.id,
                                label: `${
                                  su.room_service.service.name
                                } - ${formatCurrency(
                                  su.price_used * su.usage_value
                                )} - (${su.price_used} x ${su.usage_value})`,
                              })),
                            ]}
                            disabled={
                              loadingServiceUsages || serviceUsages.length === 0
                            }
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
                          disabled={
                            item.source_type === "service_usage" &&
                            item.service_usage_id
                          }
                          inline
                        />
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeItem(index)}
                          disabled={formData.items.length === 1}
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
