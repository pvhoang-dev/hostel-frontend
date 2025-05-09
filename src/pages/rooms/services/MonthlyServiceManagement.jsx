import React, { useState, useEffect } from "react";
import {
  Card,
  Select,
  Button,
  Table,
  message,
  Form,
  InputNumber,
  Spin,
  Typography,
  Row,
  Col,
  DatePicker,
  Divider,
  Tag,
  Modal,
  Checkbox,
  Alert,
} from "antd";
import {
  getAvailableHouses,
  getRoomsNeedingUpdate,
} from "../../../api/monthlyServices";
import RoomServiceUsageForm from "../../../components/forms/RoomServiceUsageForm";
import moment from "moment";

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
      message.error("Không thể tải danh sách nhà");
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
      message.error("Không thể tải danh sách phòng cần cập nhật dịch vụ");
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
      message.success("Đã cập nhật dịch vụ thành công");
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
          <Tag color={status === "occupied" ? "green" : "default"}>
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
          <Tag color="orange">Cần cập nhật</Tag>
        ) : (
          <Tag color="green">Đã cập nhật</Tag>
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
    <div>
      <Card title="Quản lý dịch vụ hàng tháng">
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Text strong>Nhà:</Text>
            <Select
              placeholder="Chọn nhà"
              style={{ width: "100%", marginTop: 8 }}
              onChange={handleHouseChange}
              allowClear
            >
              {houses.map((house) => (
                <Option key={house.id} value={house.id}>
                  {house.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <Text strong>Tháng:</Text>
            <Select
              style={{ width: "100%", marginTop: 8 }}
              value={selectedMonth}
              onChange={handleMonthChange}
            >
              {months.map((month) => (
                <Option key={month.value} value={month.value}>
                  {month.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <Text strong>Năm:</Text>
            <Select
              style={{ width: "100%", marginTop: 8 }}
              value={selectedYear}
              onChange={handleYearChange}
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
              style={{ marginRight: 8 }}
            >
              Hiển thị tất cả phòng đã thuê
            </Checkbox>
          </Col>
        </Row>

        <Divider />

        <div style={{ marginBottom: 16 }}>
          <Title level={4}>Danh sách phòng</Title>
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
                  style={{ marginBottom: 16 }}
                />
              )}
            </Col>
          </Row>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={roomsNeedingUpdate}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>

      <Modal
        title={`Cập nhật dịch vụ phòng ${selectedRoom?.room_number || ""}`}
        open={roomServiceModalVisible}
        onCancel={() => handleRoomServiceModalClose(false)}
        footer={null}
        width="90%"
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
