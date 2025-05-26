import React from "react";
import Card from "../../../components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const RevenueStatistics = ({ data, loading }) => {
  if (!data) return <div className="alert alert-warning">Không có dữ liệu thống kê doanh thu</div>;

  const { monthly_revenue = [], payment_status = {}, pending_invoices = [] } = data;

  // Dữ liệu cho biểu đồ tình trạng thanh toán
  const paymentStatusData = [
    { name: "Đã thanh toán", value: payment_status?.paid_count || 0 },
    { name: "Chưa thanh toán", value: payment_status?.unpaid_count || 0 },
  ];

  return (
    <div className="row g-3">
      {/* Biểu đồ doanh thu theo tháng */}
      <div className="col-md-8">
        <Card title="Doanh thu theo tháng">
          <div style={{ height: "400px" }}>
            {Array.isArray(monthly_revenue) && monthly_revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthly_revenue}
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
                  <Tooltip formatter={(value) => value.toLocaleString() + " VND"} />
                  <Legend />
                  <Bar dataKey="amount" fill="#0088FE" name="Doanh thu (VND)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="alert alert-info">Không có dữ liệu doanh thu theo tháng</div>
            )}
          </div>
        </Card>
      </div>

      {/* Biểu đồ tình trạng thanh toán */}
      <div className="col-md-4">
        <Card title="Tình trạng thanh toán">
          <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
            {paymentStatusData.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="alert alert-info">Không có dữ liệu trạng thái thanh toán</div>
            )}
          </div>
          <div className="row text-center mt-3">
            <div className="col-6">
              <h5>{payment_status?.paid_count || 0}</h5>
              <p className="text-muted mb-0">Đã thanh toán</p>
            </div>
            <div className="col-6">
              <h5>{payment_status?.unpaid_count || 0}</h5>
              <p className="text-muted mb-0">Chưa thanh toán</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Danh sách hóa đơn chờ thanh toán */}
      <div className="col-md-12">
        <Card title="Hóa đơn chờ thanh toán giá trị lớn">
          <div className="table-responsive">
            <table className="table table-bordered table-hover mb-0">
              <thead>
                <tr>
                  <th>Mã hóa đơn</th>
                  <th>Phòng</th>
                  <th>Nhà</th>
                  <th>Ngày tạo</th>
                  <th>Hạn thanh toán</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(pending_invoices) && pending_invoices.length > 0 ? (
                  pending_invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>{invoice.code}</td>
                      <td>{invoice.room_number}</td>
                      <td>{invoice.house_name}</td>
                      <td>{invoice.created_at}</td>
                      <td>{invoice.due_date}</td>
                      <td className="text-end">{invoice.total_amount?.toLocaleString()} VND</td>
                      <td>
                        <span className="badge bg-warning">Chờ thanh toán</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">Không có hóa đơn chờ thanh toán</td>
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

export default RevenueStatistics; 