import React from "react";
import Card from "../../../components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const EquipmentStatistics = ({ data, loading }) => {
  if (!data) return null;

  const { equipment_inventory, rooms_missing_equipment } = data;

  return (
    <div className="row g-3">
      {/* Biểu đồ thiết bị trong kho */}
      <div className="col-md-12">
        <Card title="Thiết bị trong kho">
          <div style={{ height: "400px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={equipment_inventory}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="available_count" fill="#0088FE" name="Số lượng khả dụng" />
                <Bar dataKey="in_use_count" fill="#FF8042" name="Số lượng đang sử dụng" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Danh sách phòng thiếu thiết bị */}
      <div className="col-md-12">
        <Card title="Phòng thiếu thiết bị">
          <div className="table-responsive">
            <table className="table table-bordered table-hover mb-0">
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Nhà</th>
                  <th>Thiết bị thiếu</th>
                  <th>Số lượng thiếu</th>
                  <th>Trạng thái phòng</th>
                </tr>
              </thead>
              <tbody>
                {rooms_missing_equipment && rooms_missing_equipment.length > 0 ? (
                  rooms_missing_equipment.map((room, index) => (
                    <tr key={index}>
                      <td>{room.room_number}</td>
                      <td>{room.house_name}</td>
                      <td>
                        <ul className="list-unstyled mb-0">
                          {room.missing_equipment.map((equipment, idx) => (
                            <li key={idx}>{equipment.name}</li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        <ul className="list-unstyled mb-0">
                          {room.missing_equipment.map((equipment, idx) => (
                            <li key={idx}>{equipment.missing_count}</li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        {room.is_occupied ? (
                          <span className="badge bg-success">Đã thuê</span>
                        ) : (
                          <span className="badge bg-warning">Còn trống</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">Không có phòng thiếu thiết bị</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      
      {/* Thống kê tình trạng thiết bị */}
      <div className="col-md-12">
        <Card title="Tình trạng thiết bị">
          <div className="table-responsive">
            <table className="table table-bordered table-hover mb-0">
              <thead>
                <tr>
                  <th>Loại thiết bị</th>
                  <th>Tổng số</th>
                  <th>Đang sử dụng</th>
                  <th>Khả dụng</th>
                  <th>Hỏng hóc</th>
                  <th>Tỷ lệ sử dụng</th>
                </tr>
              </thead>
              <tbody>
                {equipment_inventory && equipment_inventory.length > 0 ? (
                  equipment_inventory.map((equipment) => (
                    <tr key={equipment.id}>
                      <td>{equipment.name}</td>
                      <td className="text-center">{equipment.total_count}</td>
                      <td className="text-center">{equipment.in_use_count}</td>
                      <td className="text-center">{equipment.available_count}</td>
                      <td className="text-center">{equipment.damaged_count || 0}</td>
                      <td className="text-center">
                        {equipment.total_count > 0 
                          ? `${((equipment.in_use_count / equipment.total_count) * 100).toFixed(0)}%` 
                          : '0%'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">Không có dữ liệu thiết bị</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EquipmentStatistics; 