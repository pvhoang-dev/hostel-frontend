import React from "react";
import Card from "../../../components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const ContractsStatistics = ({ data, loading, period, house_name }) => {
  if (!data) return null;

  const { expiring_contracts, new_contracts, tenant_stats } = data;

  // Xử lý tên kỳ để hiển thị đúng
  let periodText;
  if (period === 'monthly') {
    periodText = 'tháng';
  } else if (period === 'quarterly') {
    periodText = 'quý';
  } else if (period === 'yearly') {
    periodText = 'năm';
  } else {
    periodText = 'kỳ';
  }
  
  // Prepare title with house name if selected
  const houseTitle = house_name ? `Khách thuê - ${house_name}` : "Khách thuê theo nhà";

  return (
    <div className="row g-3">
      {/* Biểu đồ hợp đồng mới */}
      <div className="col-md-6">
        <Card title={`Hợp đồng mới theo ${periodText} ${house_name ? `- ${house_name}` : ''}`}>
          <div style={{ height: "300px" }}>
            {new_contracts && new_contracts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={new_contracts}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#0088FE" name="Số hợp đồng" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="alert alert-warning">Không có dữ liệu hợp đồng mới</div>
            )}
          </div>
        </Card>
      </div>

      {/* Thống kê khách thuê theo nhà */}
      <div className="col-md-6">
        <Card title={houseTitle}>
          <div style={{ height: "300px" }}>
            {tenant_stats && tenant_stats.by_house && tenant_stats.by_house.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tenant_stats.by_house}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="house_name" tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tenants_count" fill="#FF8042" name="Số người thuê" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="alert alert-warning">Không có dữ liệu khách thuê</div>
            )}
          </div>
        </Card>
      </div>

      {/* Hợp đồng sắp đáo hạn */}
      <div className="col-md-12">
        <Card title="Hợp đồng sắp đáo hạn">
          <div className="table-responsive">
            <table className="table table-bordered table-hover mb-0">
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Nhà</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                  <th>Còn lại (ngày)</th>
                  <th>Người thuê</th>
                  <th>Tự động gia hạn</th>
                </tr>
              </thead>
              <tbody>
                {expiring_contracts && expiring_contracts.length > 0 ? (
                  expiring_contracts.map((contract) => (
                    <tr key={contract.id}>
                      <td>{contract.room_number}</td>
                      <td>{contract.house_name}</td>
                      <td>{contract.start_date}</td>
                      <td>{contract.end_date}</td>
                      <td>
                        <span className={`badge ${contract.days_remaining < 7 ? 'bg-danger' : 'bg-warning'} text-white`}>
                          {contract.days_remaining} ngày
                        </span>
                      </td>
                      <td>
                        {contract.tenants.map((tenant) => (
                          <div key={tenant.id}>{tenant.name} - {tenant.phone_number}</div>
                        ))}
                      </td>
                      <td>
                        {contract.auto_renew ? (
                          <span className="badge bg-success text-white">Có</span>
                        ) : (
                          <span className="badge bg-danger text-white">Không</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">Không có hợp đồng sắp đáo hạn</td>
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

export default ContractsStatistics; 