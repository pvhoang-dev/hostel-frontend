import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Input,
  Button,
  Spin,
  Table,
  InputNumber,
  Typography,
  Row,
  Col,
  Divider,
  Checkbox,
  Alert,
} from "antd";
import {
  getRoomServices,
  saveRoomServiceUsage,
} from "../../api/monthlyServices";
import {
  SaveOutlined,
  CloseOutlined,
  CalculatorOutlined,
} from "@ant-design/icons";
import useAlert from "../../hooks/useAlert";
import "../../styles/RoomServiceUsageForm.css";

const { Text } = Typography;

const RoomServiceForm = ({ roomId, month, year, onFinish, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [services, setServices] = useState([]);
  const [serviceApplied, setServiceApplied] = useState({});
  const [errors, setErrors] = useState({});
  const { showSuccess, showError, showWarning } = useAlert();

  // Sử dụng useRef để lưu trữ dữ liệu mà không gây re-render
  const apiDataRef = useRef({
    hasInvoice: false,
    invoiceId: null,
  });

  useEffect(() => {
    if (roomId && month && year) {
      fetchRoomServices();
    }
  }, [roomId, month, year]);

  const fetchRoomServices = async () => {
    try {
      setLoading(true);
      const response = await getRoomServices(roomId, month, year);
      setRoomData(response.data.room);

      const servicesData = response.data.services;
      setServices(servicesData);

      // Lưu thông tin về hóa đơn trực tiếp vào ref
      apiDataRef.current.hasInvoice = response.data.has_invoice || false;
      apiDataRef.current.invoiceId = response.data.invoice_id || null;

      // Set initial service applied state
      const initialServiceApplied = {};
      servicesData.forEach((service) => {
        // Chỉ áp dụng checked cho dịch vụ đã có dữ liệu (has_usage = true)
        initialServiceApplied[service.room_service_id] = service.has_usage;
      });
      setServiceApplied(initialServiceApplied);

      // Set initial form values
      const initialValues = {};
      servicesData.forEach((service) => {
        initialValues[`room_service_id_${service.room_service_id}`] =
          service.room_service_id;
        initialValues[`start_meter_${service.room_service_id}`] =
          service.start_meter;
        initialValues[`end_meter_${service.room_service_id}`] =
          service.end_meter;
        initialValues[`usage_value_${service.room_service_id}`] =
          service.usage_value || (service.is_fixed ? 1 : null);
        initialValues[`price_used_${service.room_service_id}`] =
          service.price_used;
        initialValues[`description_${service.room_service_id}`] =
          service.description;
      });

      form.setFieldsValue(initialValues);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch room services:", error);
      setLoading(false);
    }
  };

  const handleCalculateUsage = (serviceId) => {
    const service = services.find((s) => s.room_service_id === serviceId);
    const startMeter = form.getFieldValue(`start_meter_${serviceId}`);
    const endMeter = form.getFieldValue(`end_meter_${serviceId}`);

    // Chỉ tính toán khi cả hai giá trị đều có
    if (startMeter !== undefined && endMeter !== undefined) {
      // Validate số cuối >= số đầu
      if (endMeter < startMeter) {
        setErrors({
          ...errors,
          [`end_meter_${serviceId}`]: "Số cuối phải lớn hơn hoặc bằng số đầu",
        });
        return;
      } else {
        // Xóa lỗi nếu hợp lệ
        const updatedErrors = { ...errors };
        delete updatedErrors[`end_meter_${serviceId}`];
        setErrors(updatedErrors);
      }

      const usage = endMeter - startMeter;

      // Cập nhật số lượng và thành tiền
      form.setFieldsValue({
        [`usage_value_${serviceId}`]: usage,
        [`price_used_${serviceId}`]: service.price * usage,
      });
    }
  };

  const calculatePrice = (serviceId, usageValue) => {
    if (!usageValue) return;

    const service = services.find((s) => s.room_service_id === serviceId);
    if (service) {
      const price = service.price * usageValue;
      form.setFieldsValue({
        [`price_used_${serviceId}`]: price,
      });
    }
  };

  const handleServiceAppliedChange = (serviceId, checked) => {
    const service = services.find((s) => s.room_service_id === serviceId);

    const updatedServiceApplied = { ...serviceApplied };
    updatedServiceApplied[serviceId] = checked;
    setServiceApplied(updatedServiceApplied);

    if (!checked) {
      // Nếu không áp dụng, xóa các giá trị
      form.setFieldsValue({
        [`usage_value_${serviceId}`]: 0,
        [`price_used_${serviceId}`]: 0,
      });
    } else {
      // Nếu áp dụng, đặt giá trị mặc định
      if (service.is_metered) {
        // Nếu là dịch vụ đo số, tự động tính toán nếu đã có số đầu/cuối
        const startMeter = form.getFieldValue(`start_meter_${serviceId}`);
        const endMeter = form.getFieldValue(`end_meter_${serviceId}`);

        if (
          startMeter !== undefined &&
          endMeter !== undefined &&
          endMeter >= startMeter
        ) {
          // Nếu có đủ số đầu và số cuối hợp lệ, tính toán usage_value và price_used
          const usage = endMeter - startMeter;
          form.setFieldsValue({
            [`usage_value_${serviceId}`]: usage,
            [`price_used_${serviceId}`]: service.price * usage,
          });
        }
      } else {
        // Nếu là dịch vụ cố định, thiết lập số lượng là 1 và giá = đơn giá
        form.setFieldsValue({
          [`usage_value_${serviceId}`]: 1,
          [`price_used_${serviceId}`]: service.price,
        });
      }
    }
  };

  const handleSubmit = async () => {
    try {
      // Kiểm tra hợp lệ trước khi submit
      let hasValidationError = false;
      let validationErrors = { ...errors };

      // Duyệt qua từng dịch vụ để kiểm tra
      for (const service of services) {
        const serviceId = service.room_service_id;
        const isApplied = serviceApplied[serviceId];

        // Nếu dịch vụ được áp dụng và là loại đo đếm
        if (isApplied && service.is_metered) {
          const startMeter = form.getFieldValue(`start_meter_${serviceId}`);
          const endMeter = form.getFieldValue(`end_meter_${serviceId}`);

          if (
            startMeter === undefined ||
            startMeter === null ||
            startMeter === ""
          ) {
            validationErrors[`start_meter_${serviceId}`] =
              "Vui lòng nhập số đầu";
            hasValidationError = true;
          }

          if (endMeter === undefined || endMeter === null || endMeter === "") {
            validationErrors[`end_meter_${serviceId}`] =
              "Vui lòng nhập số cuối";
            hasValidationError = true;
          }

          if (
            startMeter !== undefined &&
            endMeter !== undefined &&
            endMeter < startMeter
          ) {
            validationErrors[`end_meter_${serviceId}`] =
              "Số cuối phải lớn hơn hoặc bằng số đầu";
            hasValidationError = true;
          }
        }
        // Nếu dịch vụ được áp dụng và không phải là loại đo đếm
        else if (isApplied && !service.is_metered) {
          const usageValue = form.getFieldValue(`usage_value_${serviceId}`);
          if (
            usageValue === undefined ||
            usageValue === null ||
            usageValue === ""
          ) {
            validationErrors[`usage_value_${serviceId}`] =
              "Vui lòng nhập số lượng";
            hasValidationError = true;
          }
        }
      }

      if (hasValidationError) {
        setErrors(validationErrors);
        showError("Vui lòng điền đầy đủ thông tin cho các dịch vụ được chọn");
        return;
      }

      // Kiểm tra lỗi trước khi submit
      if (Object.keys(errors).length > 0) {
        showError("Vui lòng sửa các lỗi trước khi gửi");
        return;
      }

      setSubmitting(true);
      const formValues = form.getFieldsValue();

      // Đảm bảo tính toán lại usage_value cho các dịch vụ đo đếm
      services.forEach((service) => {
        if (service.is_metered && serviceApplied[service.room_service_id]) {
          const serviceId = service.room_service_id;
          const startMeter = formValues[`start_meter_${serviceId}`];
          const endMeter = formValues[`end_meter_${serviceId}`];

          if (startMeter !== undefined && endMeter !== undefined) {
            formValues[`usage_value_${serviceId}`] = endMeter - startMeter;
            formValues[`price_used_${serviceId}`] =
              service.price * (endMeter - startMeter);
          }
        }
      });

      // Format the data for API
      const formattedServicesData = services
        .filter((service) => serviceApplied[service.room_service_id]) // Chỉ lấy các dịch vụ được chọn
        .map((service) => {
          const serviceId = service.room_service_id;

          return {
            room_service_id: serviceId,
            start_meter: formValues[`start_meter_${serviceId}`],
            end_meter: formValues[`end_meter_${serviceId}`],
            usage_value: formValues[`usage_value_${serviceId}`] || 0,
            price_used: formValues[`price_used_${serviceId}`] || 0,
            description: formValues[`description_${serviceId}`] || "",
          };
        });

      // Tạo danh sách các dịch vụ bị bỏ chọn
      const uncheckedServices = services
        .filter((service) => !serviceApplied[service.room_service_id])
        .map((service) => service.room_service_id);

      if (apiDataRef.current.hasInvoice) {
        // Sử dụng confirm thông thường thay vì Modal
        const confirmResult = window.confirm(
          `Đã tồn tại hóa đơn cho phòng này trong tháng ${month}/${year}. Bạn có muốn cập nhật hóa đơn dựa trên những thay đổi về dịch vụ không?`
        );

        if (confirmResult) {
          // Người dùng chọn "OK"
          await saveServicesAndInvoice(
            formattedServicesData,
            true,
            uncheckedServices
          );
        } else {
          // Người dùng chọn "Cancel"
          await saveServicesAndInvoice(
            formattedServicesData,
            false,
            uncheckedServices
          );
        }
      } else {
        // Nếu chưa có hóa đơn, tiến hành lưu bình thường
        await saveServicesAndInvoice(
          formattedServicesData,
          true,
          uncheckedServices
        );
      }
    } catch (error) {
      console.error("Failed to save service usage:", error);
      const errorMessage =
        "Lỗi khi lưu dịch vụ: " +
        (error.response?.data?.message || error.message);

      showError(errorMessage);

      setSubmitting(false);
    }
  };

  // Hàm xử lý việc lưu dịch vụ và hóa đơn
  const saveServicesAndInvoice = async (
    services,
    updateInvoice = true,
    uncheckedServices = []
  ) => {
    try {
      setSubmitting(true);

      await saveRoomServiceUsage({
        room_id: roomId,
        month: month,
        year: year,
        services: services,
        unchecked_services: uncheckedServices,
        update_invoice: updateInvoice, // Thêm tham số để API biết có cập nhật hóa đơn hay không
      });

      setSubmitting(false);

      // Hiển thị thông báo thành công
      showSuccess(
        "Đã lưu dịch vụ thành công" +
          (updateInvoice ? " và cập nhật hóa đơn" : "")
      );

      onFinish();
    } catch (error) {
      console.error("Failed to save service usage:", error);
      const errorMessage =
        "Lỗi khi lưu dịch vụ: " +
        (error.response?.data?.message || error.message);

      showError(errorMessage);

      setSubmitting(false);
    }
  };

  const calculateAllPrices = () => {
    let updated = 0;
    const values = form.getFieldsValue();
    const updates = {};

    // Lặp qua tất cả services đang được áp dụng
    services.forEach((service) => {
      const serviceId = service.room_service_id;
      if (serviceApplied[serviceId]) {
        const usageValue = values[`usage_value_${serviceId}`];

        if (usageValue) {
          const price = service.price * usageValue;
          updates[`price_used_${serviceId}`] = price;
          updated++;
        }
      }
    });

    if (updated > 0) {
      form.setFieldsValue(updates);
      showSuccess(`Đã tính toán lại thành tiền cho ${updated} dịch vụ`);
    } else {
      showWarning("Không có dịch vụ nào được tính lại thành tiền");
    }
  };

  const columns = [
    {
      title: "Dịch vụ",
      dataIndex: "service_name",
      key: "service_name",
      width: 140,
    },
    {
      title: "Áp dụng",
      key: "is_applied",
      width: 80,
      render: (_, record) => (
        <Checkbox
          checked={serviceApplied[record.room_service_id] || false}
          onChange={(e) =>
            handleServiceAppliedChange(record.room_service_id, e.target.checked)
          }
          style={{ color: "#fff" }}
        />
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(price),
    },
    {
      title: "Số đầu",
      key: "start_meter",
      width: 130,
      render: (_, record) =>
        record.is_metered ? (
          <Form.Item
            name={`start_meter_${record.room_service_id}`}
            rules={[
              {
                required:
                  record.is_metered && serviceApplied[record.room_service_id],
                message: "Vui lòng nhập số đầu",
              },
            ]}
            noStyle
          >
            <InputNumber
              disabled={
                record.has_usage && serviceApplied[record.room_service_id]
              }
              style={{ width: "100%" }}
              min={0}
              onChange={() => {
                const endMeter = form.getFieldValue(
                  `end_meter_${record.room_service_id}`
                );
                if (endMeter !== undefined) {
                  handleCalculateUsage(record.room_service_id);
                }
              }}
              className="dark-input"
            />
          </Form.Item>
        ) : null,
    },
    {
      title: "Số cuối",
      key: "end_meter",
      width: 140,
      render: (_, record) =>
        record.is_metered ? (
          <div>
            <Form.Item
              name={`end_meter_${record.room_service_id}`}
              validateStatus={
                errors[`end_meter_${record.room_service_id}`] ? "error" : ""
              }
              help={errors[`end_meter_${record.room_service_id}`]}
              rules={[
                {
                  required:
                    record.is_metered && serviceApplied[record.room_service_id],
                  message: "Vui lòng nhập số cuối",
                },
              ]}
              noStyle
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                disabled={!serviceApplied[record.room_service_id]}
                onChange={() => handleCalculateUsage(record.room_service_id)}
                className="dark-input"
              />
            </Form.Item>
            {errors[`end_meter_${record.room_service_id}`] && (
              <div style={{ color: "red", fontSize: "12px" }}>
                {errors[`end_meter_${record.room_service_id}`]}
              </div>
            )}
          </div>
        ) : null,
    },
    {
      title: "Số lượng",
      key: "usage_value",
      width: 120,
      render: (_, record) => (
        <div>
          <Form.Item
            name={`usage_value_${record.room_service_id}`}
            validateStatus={
              errors[`usage_value_${record.room_service_id}`] ? "error" : ""
            }
            help={errors[`usage_value_${record.room_service_id}`]}
            rules={[
              {
                required: serviceApplied[record.room_service_id],
                message: "Vui lòng nhập số lượng",
              },
            ]}
            noStyle
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              disabled={
                !serviceApplied[record.room_service_id] || record.is_metered
              }
              onChange={(value) =>
                calculatePrice(record.room_service_id, value)
              }
              className="dark-input"
            />
          </Form.Item>
          {errors[`usage_value_${record.room_service_id}`] && (
            <div style={{ color: "red", fontSize: "12px" }}>
              {errors[`usage_value_${record.room_service_id}`]}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      width: 80,
    },
    {
      title: "Thành tiền",
      key: "price_used",
      width: 150,
      render: (_, record) => (
        <Form.Item
          name={`price_used_${record.room_service_id}`}
          rules={[
            {
              required: serviceApplied[record.room_service_id],
              message: "Vui lòng nhập thành tiền",
            },
          ]}
          noStyle
        >
          <InputNumber
            style={{ width: "100%" }}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            min={0}
            disabled={!serviceApplied[record.room_service_id]}
            className="dark-input"
          />
        </Form.Item>
      ),
    },
    {
      title: "Ghi chú",
      key: "description",
      width: 160,
      render: (_, record) => (
        <Form.Item name={`description_${record.room_service_id}`} noStyle>
          <Input
            style={{ width: "100%" }}
            placeholder="Ghi chú"
            disabled={!serviceApplied[record.room_service_id]}
            className="dark-input"
          />
        </Form.Item>
      ),
    },
  ];

  return (
    <Spin spinning={loading || submitting} tip="Đang xử lý...">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ backgroundColor: "#343a40", color: "#f8f9fa" }}
      >
        {roomData && (
          <Row gutter={16} className="mb-3">
            <Col span={8}>
              <Text strong style={{ color: "#fff" }}>
                Nhà:{" "}
              </Text>
              <Text style={{ color: "#fff" }}>{roomData.house.name}</Text>
            </Col>
            <Col span={8}>
              <Text strong style={{ color: "#fff" }}>
                Phòng:{" "}
              </Text>
              <Text style={{ color: "#fff" }}>{roomData.room_number}</Text>
            </Col>
            <Col span={8}>
              <Text strong style={{ color: "#fff" }}>
                Tháng/Năm:{" "}
              </Text>
              <Text style={{ color: "#fff" }}>
                {month}/{year}
              </Text>
            </Col>
          </Row>
        )}

        <Divider />

        <Row justify="end" style={{ marginBottom: 16 }}>
          <Col span={24} style={{ marginBottom: 10 }}>
            <Alert
              message="Lưu ý: Chỉ những dịch vụ được đánh dấu ở cột 'Áp dụng' mới được lưu và tính vào hóa đơn. Nếu không muốn sử dụng dịch vụ nào, hãy bỏ đánh dấu ở cột đó. Khi bỏ đánh dấu và lưu, dịch vụ đó sẽ bị xóa khỏi hệ thống."
              type="info"
              showIcon
              style={{ marginBottom: 10 }}
            />
          </Col>
          <Col>
            <Button
              icon={<CalculatorOutlined />}
              onClick={calculateAllPrices}
              type="primary"
              ghost
            >
              Tính lại thành tiền
            </Button>
          </Col>
        </Row>

        <Table
          rowKey={(record) => record.room_service_id}
          pagination={false}
          dataSource={services}
          columns={columns}
          size="middle"
          bordered
          scroll={{ x: "max-content" }}
          className="custom-dark-table"
        />

        <Divider />

        <Row justify="end" gutter={16} style={{ marginTop: 16 }}>
          <Col>
            <Button icon={<CloseOutlined />} onClick={onCancel}>
              Hủy
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              onClick={handleSubmit}
              icon={<SaveOutlined />}
              loading={submitting}
            >
              Lưu dịch vụ
            </Button>
          </Col>
        </Row>
      </Form>
    </Spin>
  );
};

export default RoomServiceForm;
