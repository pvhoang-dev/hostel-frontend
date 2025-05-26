import React from "react";
import Card from "../../../components/ui/Card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["#0088FE", "#FF8042"];

const OverviewStatistics = ({ data, loading }) => {
  if (!data) return null;

  const { overview, occupancy, revenue_comparison } = data;

  // Dữ liệu cho biểu đồ tỷ lệ phòng
  const occupancyData = [
    { name: "Đã thuê", value: occupancy?.occupied_rooms || 0 },
    { name: "Còn trống", value: occupancy?.vacant_rooms || 0 },
  ];

  return (
    <div className="row g-3">
      {/* Cards thống kê */}
      <div className="col-md-6 col-xl-3">
        <div className="card widget-flat">
          <div className="card-body">
            <div className="float-end">
              <i className="mdi mdi-home-outline"></i>
            </div>
            <h5 className="text-muted fw-normal mt-0" title="Tổng số nhà">
              Tổng số nhà
            </h5>
            <h3 className="mt-3 mb-3">{overview?.houses_count || 0}</h3>
          </div>
        </div>
      </div>

      <div className="col-md-6 col-xl-3">
        <div className="card widget-flat">
          <div className="card-body">
            <div className="float-end">
              <i className="mdi mdi-door"></i>
            </div>
            <h5 className="text-muted fw-normal mt-0" title="Tổng số phòng">
              Tổng số phòng
            </h5>
            <h3 className="mt-3 mb-3">{overview?.rooms_count || 0}</h3>
          </div>
        </div>
      </div>

      <div className="col-md-6 col-xl-3">
        <div className="card widget-flat">
          <div className="card-body">
            <div className="float-end">
              <i className="mdi mdi-file-document-outline"></i>
            </div>
            <h5 className="text-muted fw-normal mt-0" title="Hợp đồng đang hoạt động">
              Hợp đồng đang hoạt động
            </h5>
            <h3 className="mt-3 mb-3">{overview?.active_contracts_count || 0}</h3>
          </div>
        </div>
      </div>

      <div className="col-md-6 col-xl-3">
        <div className="card widget-flat">
          <div className="card-body">
            <div className="float-end">
              {revenue_comparison?.change_percent > 0 ? (
                <i className="mdi mdi-arrow-up-bold text-success"></i>
              ) : (
                <i className="mdi mdi-arrow-down-bold text-danger"></i>
              )}
            </div>
            <h5 className="text-muted fw-normal mt-0" title="So với kỳ trước">
              So với kỳ trước
            </h5>
            <h3 className={`mt-3 mb-3 ${revenue_comparison?.change_percent > 0 ? 'text-success' : 'text-danger'}`}>
              {revenue_comparison?.change_percent || 0}%
            </h3>
          </div>
        </div>
      </div>

      {/* Biểu đồ tỷ lệ phòng */}
      <div className="col-md-6">
        <Card title="Tỷ lệ sử dụng phòng">
          <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="row text-center mt-3">
            <div className="col-6">
              <h5>{occupancy?.occupied_rooms || 0}</h5>
              <p className="text-muted mb-0">Phòng đã thuê</p>
            </div>
            <div className="col-6">
              <h5>{occupancy?.vacant_rooms || 0}</h5>
              <p className="text-muted mb-0">Phòng còn trống</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Thống kê tăng giảm doanh thu */}
      <div className="col-md-6">
        <Card title="So sánh doanh thu">
          <div className="table-responsive">
            <table className="table table-bordered mb-0">
              <tbody>
                <tr>
                  <td>Kỳ hiện tại</td>
                  <td>{revenue_comparison?.current_period || ''}</td>
                </tr>
                <tr>
                  <td>Doanh thu hiện tại</td>
                  <td>{revenue_comparison?.current_revenue?.toLocaleString() || 0} VND</td>
                </tr>
                <tr>
                  <td>Kỳ trước</td>
                  <td>{revenue_comparison?.previous_period || ''}</td>
                </tr>
                <tr>
                  <td>Doanh thu kỳ trước</td>
                  <td>{revenue_comparison?.previous_revenue?.toLocaleString() || 0} VND</td>
                </tr>
                <tr>
                  <td>Thay đổi</td>
                  <td className={revenue_comparison?.change > 0 ? 'text-success' : 'text-danger'}>
                    {revenue_comparison?.change?.toLocaleString() || 0} VND
                    ({revenue_comparison?.change_percent || 0}%)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OverviewStatistics; 