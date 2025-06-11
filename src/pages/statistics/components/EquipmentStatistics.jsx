import React from "react";
import Card from "../../../components/ui/Card";

const EquipmentStatistics = ({ data, loading }) => {
  if (!data) return <div className="alert alert-warning">Không có dữ liệu thống kê thiết bị</div>;

  // Sử dụng đúng cấu trúc dữ liệu từ API
  const { missing_equipment } = data;

  return (
    <div className="row">
      {/* Danh sách phòng thiếu thiết bị */}
      <div className="col-md-12">
        <Card title="Cảnh báo phòng có ít thiết bị">
          <div className="table-responsive">
            <table className="table table-bordered table-hover mb-0">
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Nhà</th>
                  <th>Số thiết bị</th>
                  <th>Thiết bị trong phòng</th>
                  <th>Cảnh báo</th>
                </tr>
              </thead>
              <tbody>
                {missing_equipment && missing_equipment.length > 0 ? (
                  missing_equipment.map((room, index) => (
                    <tr key={index}>
                      <td>{room.room_number}</td>
                      <td>{room.house_name}</td>
                      <td>{room.equipment_count}</td>
                      <td>
                        <ul className="list-unstyled mb-0">
                          {room.equipments && room.equipments.length > 0 ? (
                            room.equipments.map((equipment, idx) => (
                              <li key={idx}>{equipment.equipment_name} ({equipment.quantity})</li>
                            ))
                          ) : (
                            <li>Không có thiết bị</li>
                          )}
                        </ul>
                      </td>
                      <td>
                        <div className="alert alert-warning p-1 m-0">{room.warning}</div>
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
    </div>
  );
};

export default EquipmentStatistics; 