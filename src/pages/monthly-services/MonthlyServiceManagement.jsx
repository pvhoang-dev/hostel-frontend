import React, { useState, useEffect } from "react";
import {
  Card,
  Select,
  Button,
  Table,
  Spin,
  Typography,
  Row,
  Col,
  Divider,
  Tag,
  Modal,
  Checkbox,
  Alert,
} from "antd";
import {
  getAvailableHouses,
  getRoomsNeedingUpdate,
} from "../../api/monthlyServices";
import RoomServiceUsageForm from "../../components/forms/RoomServiceUsageForm";
import moment from "moment";
import useAlert from "../../hooks/useAlert";
import "../../styles/MonthlyServiceManagement.css";

const { Title, Text } = Typography;
const { Option } = Select;

const MonthlyServiceManagement = () => {
  const [loading, setLoading] = useState(false);
  const [houses, setHouses] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1);
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [roomsNeedingUpdate, setRoomsNeedingUpdate] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomServiceModalVisible, setRoomServiceModalVisible] = useState(false);
  const [showAllRooms, setShowAllRooms] = useState(false);
  const [totalRooms, setTotalRooms] = useState(0);
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    fetchHouses();
  }, []);

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchRoomsNeedingUpdate();
    }
  }, [selectedHouse, selectedMonth, selectedYear, showAllRooms]);

  const fetchHouses = async () => {
    try {
      setLoading(true);
      const response = await getAvailableHouses();
      setHouses(response.data.houses);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch houses:", error);
      showError("Không thể tải danh sách nhà");
      setLoading(false);
    }
  };

  const fetchRoomsNeedingUpdate = async () => {
    try {
      setLoading(true);
      const response = await getRoomsNeedingUpdate(
        selectedMonth,
        selectedYear,
        selectedHouse,
        showAllRooms
      );
      setRoomsNeedingUpdate(response.data.rooms);
      setTotalRooms(response.data.total_rooms);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      showError("Không thể tải danh sách phòng cần cập nhật dịch vụ");
      setLoading(false);
    }
  };

  const handleHouseChange = (value) => {
    setSelectedHouse(value);
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
  };

  const handleShowAllChange = (e) => {
    setShowAllRooms(e.target.checked);
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setRoomServiceModalVisible(true);
  };

  const handleRoomServiceModalClose = (updated = false) => {
    setRoomServiceModalVisible(false);
    setSelectedRoom(null);
    if (updated) {
      fetchRoomsNeedingUpdate();
      showSuccess("Đã cập nhật dịch vụ thành công");
    }
  };

  const months = [
    { value: 1, label: "Tháng 1" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng 12" },
  ];

  const years = [];
  const currentYear = moment().year();
  for (let i = currentYear - 2; i <= currentYear + 1; i++) {
    years.push(i);
  }

  const columns = [
    {
      title: "Số phòng",
      dataIndex: "room_number",
      key: "room_number",
    },
    {
      title: "Nhà",
      dataIndex: ["house", "name"],
      key: "house_name",
    },
    {
      title: "Trạng thái phòng",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        return (
          <Tag color={status === "occupied" ? "success" : "default"}>
            {status === "occupied" ? "Đã thuê" : status}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái dịch vụ",
      key: "needs_update",
      dataIndex: "needs_update",
      render: (needsUpdate) => {
        return needsUpdate ? (
          <Tag color="warning">Cần cập nhật</Tag>
        ) : (
          <Tag color="success">Đã cập nhật</Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleRoomClick(record)}>
          {record.needs_update ? "Cập nhật dịch vụ" : "Xem/Sửa dịch vụ"}
        </Button>
      ),
    },
  ];

  return (
    <div
      className="mt-3"
      style={{ backgroundColor: "#212529", color: "#f8f9fa" }}
    >
      <Card
        title="Quản lý dịch vụ hàng tháng"
        style={{
          backgroundColor: "#343a40",
          color: "#f8f9fa",
          borderRadius: "0.25rem",
          boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
        }}
        headStyle={{
          color: "#f8f9fa",
          borderBottom: "1px solid #495057",
          padding: "1rem 1.5rem",
          fontSize: "1.25rem",
          fontWeight: 500,
        }}
        styles={{ body: { color: "#f8f9fa", padding: "1.5rem" } }}
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Text
              strong
              style={{
                color: "#f8f9fa",
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              Nhà:
            </Text>
            <Select
              placeholder="Chọn nhà"
              style={{ width: "100%", color: "#fff" }}
              onChange={handleHouseChange}
              allowClear
              dropdownStyle={{ backgroundColor: "#343a40" }}
              className="dark-select white-placeholder"
            >
              {houses.map((house) => (
                <Option key={house.id} value={house.id}>
                  {house.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <Text
              strong
              style={{
                color: "#f8f9fa",
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              Tháng:
            </Text>
            <Select
              style={{ width: "100%", color: "#fff" }}
              value={selectedMonth}
              onChange={handleMonthChange}
              dropdownStyle={{ backgroundColor: "#343a40" }}
              className="dark-select white-placeholder"
            >
              {months.map((month) => (
                <Option key={month.value} value={month.value}>
                  {month.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <Text
              strong
              style={{
                color: "#f8f9fa",
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              Năm:
            </Text>
            <Select
              style={{ width: "100%", color: "#fff" }}
              value={selectedYear}
              onChange={handleYearChange}
              dropdownStyle={{ backgroundColor: "#343a40" }}
              className="dark-select white-placeholder"
            >
              {years.map((year) => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Row style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Checkbox
              checked={showAllRooms}
              onChange={handleShowAllChange}
              style={{ marginRight: 8, color: "#f8f9fa" }}
            >
              Hiển thị tất cả phòng đã thuê
            </Checkbox>
          </Col>
        </Row>

        <Divider
          style={{ borderTop: "1px solid #495057", margin: "1.5rem 0" }}
        />

        <div style={{ marginBottom: 24 }}>
          <Title
            level={4}
            style={{ color: "#f8f9fa", fontWeight: 500, marginBottom: "1rem" }}
          >
            Danh sách phòng
          </Title>
          <Row gutter={16}>
            <Col span={24}>
              {!showAllRooms && (
                <Alert
                  message={`${roomsNeedingUpdate.length} phòng cần cập nhật dịch vụ / ${totalRooms} phòng đã thuê`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}
              {showAllRooms && roomsNeedingUpdate.length === 0 && (
                <Alert
                  message="Không tìm thấy phòng nào"
                  type="warning"
                  showIcon
                  style={{
                    marginBottom: 16,
                    backgroundColor: "#ffc107",
                    borderColor: "#ffc107",
                    color: "#212529",
                    borderRadius: "0.25rem",
                  }}
                />
              )}
              <Alert
                message="Lưu ý: Khi tạo dịch vụ tháng cho một phòng, hệ thống sẽ tự động tạo hóa đơn tương ứng."
                type="info"
                showIcon
                style={{
                  marginBottom: 16,
                  backgroundColor: "#0d6efd",
                  borderColor: "#0d6efd",
                  color: "#fff",
                  borderRadius: "0.25rem",
                }}
              />
              <Alert
                message="Lưu ý quan trọng: Chỉ những dịch vụ được chọn (đánh dấu ở cột 'Áp dụng') mới được lưu vào hệ thống. Những dịch vụ không được chọn sẽ không xuất hiện trong hóa đơn."
                type="warning"
                showIcon
                style={{
                  marginBottom: 16,
                  backgroundColor: "#fd7e14",
                  borderColor: "#fd7e14",
                  color: "#fff",
                  borderRadius: "0.25rem",
                }}
              />
            </Col>
          </Row>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={roomsNeedingUpdate}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="bootstrap-dark-table"
          />
        </Spin>
      </Card>

      <Modal
        open={roomServiceModalVisible}
        onCancel={() => handleRoomServiceModalClose(false)}
        footer={null}
        width="90%"
        style={{ top: 20, zIndex: 1003 }}
        styles={{
          body: {
            backgroundColor: "#343a40",
            color: "#f8f9fa",
            padding: "1.5rem",
          },
          header: {
            backgroundColor: "#343a40",
            color: "#f8f9fa",
            borderBottom: "1px solid #495057",
            padding: "1rem",
          },
        }}
        wrapClassName="service-modal-custom"
      >
        {selectedRoom && (
          <RoomServiceUsageForm
            roomId={selectedRoom.id}
            month={selectedMonth}
            year={selectedYear}
            onFinish={() => handleRoomServiceModalClose(true)}
            onCancel={() => handleRoomServiceModalClose(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default MonthlyServiceManagement;
