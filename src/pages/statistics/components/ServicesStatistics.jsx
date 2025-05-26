import React from "react";
import Card from "../../../components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const ServicesStatistics = ({ data, loading }) => {
  if (!data) return <div className="alert alert-warning">Không có dữ liệu thống kê dịch vụ</div>;

  const { monthly_usage = [], service_revenue = {} } = data;

  // Dữ liệu cho biểu đồ doanh thu dịch vụ
  const serviceRevenueData = [
    { name: "Dịch vụ cố định", value: service_revenue?.fixed_services_revenue || 0 },
    { name: "Dịch vụ biến động", value: service_revenue?.variable_services_revenue || 0 },
  ];

  return (
    <div className="row g-3">
      {/* Biểu đồ sử dụng dịch vụ theo tháng */}
      <div className="col-md-8">
        <Card title="Sử dụng dịch vụ theo tháng">
          <div style={{ height: "400px" }}>
            {Array.isArray(monthly_usage) && monthly_usage.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthly_usage}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="usage_count" fill="#0088FE" name="Số lượng" />
                  <Bar dataKey="total_amount" fill="#00C49F" name="Tổng tiền (VND)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="alert alert-info">Không có dữ liệu sử dụng dịch vụ theo tháng</div>
            )}
          </div>
        </Card>
      </div>

      {/* Biểu đồ doanh thu dịch vụ */}
      <div className="col-md-4">
        <Card title="Doanh thu dịch vụ">
          <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
            {serviceRevenueData.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceRevenueData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {serviceRevenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString() + " VND"} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="alert alert-info">Không có dữ liệu doanh thu dịch vụ</div>
            )}
          </div>
          <div className="row text-center mt-3">
            <div className="col-6">
              <h5>{service_revenue?.fixed_services_revenue?.toLocaleString() || 0}</h5>
              <p className="text-muted mb-0">Dịch vụ cố định (VND)</p>
            </div>
            <div className="col-6">
              <h5>{service_revenue?.variable_services_revenue?.toLocaleString() || 0}</h5>
              <p className="text-muted mb-0">Dịch vụ biến động (VND)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bảng thống kê dịch vụ phổ biến */}
      <div className="col-md-12">
        <Card title="Dịch vụ phổ biến">
          <div className="table-responsive">
            <table className="table table-bordered table-hover mb-0">
              <thead>
                <tr>
                  <th>Tên dịch vụ</th>
                  <th>Loại dịch vụ</th>
                  <th>Số lần sử dụng</th>
                  <th>Tổng doanh thu</th>
                  <th>Giá trung bình</th>
                </tr>
              </thead>
              <tbody>
                {service_revenue?.popular_services && Array.isArray(service_revenue.popular_services) && service_revenue.popular_services.length > 0 ? (
                  service_revenue.popular_services.map((service) => (
                    <tr key={service.id}>
                      <td>{service.name}</td>
                      <td>{service.is_fixed ? "Cố định" : "Biến động"}</td>
                      <td className="text-center">{service.usage_count}</td>
                      <td className="text-end">{service.total_revenue?.toLocaleString()} VND</td>
                      <td className="text-end">{service.average_price?.toLocaleString()} VND</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">Không có dữ liệu dịch vụ</td>
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

export default ServicesStatistics; 