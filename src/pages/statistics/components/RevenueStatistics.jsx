import React, { useState, useEffect } from "react";
import Card from "../../../components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Pagination from "../../../components/ui/Pagination";
import { statisticsService } from "../../../api/statistics";
import Loader from "../../../components/ui/Loader";
import { formatCurrency } from "../../../utils/formatters";
import { Link } from "react-router-dom";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const RevenueStatistics = ({ data, loading: initialLoading }) => {
  // State for pagination and invoices
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [filters, setFilters] = useState({});

  if (!data) return <div className="alert alert-warning">Không có dữ liệu thống kê doanh thu</div>;

  // Extract data using the correct property names from the API response
  const { revenue_data, invoice_status } = data;
  
  // Xác định kiểu dữ liệu doanh thu (monthly/quarterly/yearly/date_range)
  let revenueType = 'monthly';
  let chartData = [];
  let chartTitle = '';
  
  if (revenue_data) {
    // Xử lý theo cấu trúc dữ liệu
    if (revenue_data.monthly_data) {
      revenueType = 'monthly';
      chartData = revenue_data.monthly_data || [];
      chartTitle = revenue_data.title || `Doanh thu theo tháng (${revenue_data.year || new Date().getFullYear()})`;
    } else if (revenue_data.quarterly_data) {
      revenueType = 'quarterly';
      chartData = revenue_data.quarterly_data || [];
      chartTitle = revenue_data.title || `Doanh thu theo quý (${revenue_data.year || new Date().getFullYear()})`;
    } else if (revenue_data.yearly_data) {
      revenueType = 'yearly';
      chartData = revenue_data.yearly_data || [];
      chartTitle = revenue_data.title || 'Doanh thu theo năm';
    } else if (revenue_data.data) {
      // Trường hợp date_range
      revenueType = 'date_range';
      chartData = revenue_data.data || [];
      chartTitle = `Doanh thu từ ${revenue_data.date_range?.from || ''} đến ${revenue_data.date_range?.to || ''}`;
    }
  }
  
  // Prepare data for the payment status chart - đảm bảo invoice_status không rỗng
  const paymentStatusData = invoice_status ? [
    { name: "Đã thanh toán", value: parseInt(invoice_status.completed) || 0 },
    { name: "Chờ xác nhận", value: parseInt(invoice_status.waiting) || 0 },
    { name: "Chờ thanh toán", value: parseInt(invoice_status.pending) || 0 }
  ].filter(item => item.value > 0) : []; // Only include non-zero values

  // Create custom tooltip formatter for the bar chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      let labelText = '';
      
      if (revenueType === 'monthly') {
        labelText = `Tháng ${label}`;
      } else if (revenueType === 'quarterly') {
        labelText = `Quý ${label}`;
      } else if (revenueType === 'yearly') {
        labelText = `Năm ${label}`;
      } else if (revenueType === 'date_range') {
        labelText = label; // Sử dụng label trực tiếp từ dữ liệu date_range
      }
      
      return (
        <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', color: 'black' }}>
          <p className="label">{labelText}</p>
          <p className="intro">{`Doanh thu: ${formatCurrency(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  // Effect to load unpaid invoices initially - chỉ gọi khi data thay đổi và chưa có unpaidInvoices
  useEffect(() => {
    if (data && (!unpaidInvoices.length || unpaidInvoices.length === 0)) {
      // Extract any necessary filters from data (like house_id, year, month)
      const newFilters = {};
      
      // Lấy năm từ dữ liệu
      if (revenue_data?.year) {
        newFilters.year = revenue_data.year;
      }
      
      // Lấy house_id từ dữ liệu gốc nếu có
      if (data.filters?.house_id) {
        newFilters.house_id = data.filters.house_id;
      }
      
      // Update filters state
      setFilters(newFilters);
      
      // Load initial invoice data
      loadUnpaidInvoices(1, newFilters);
    }
  }, [data]);

  // Re-load when filters change from parent - bỏ việc gọi lại khi filters không thay đổi đáng kể
  useEffect(() => {
    if (data && data.filters && JSON.stringify(data.filters) !== JSON.stringify(filters)) {
      // Chỉ cập nhật filters mà không gọi API nếu không cần thiết
      const newFilters = { ...filters };
      let hasSignificantChanges = false;
      
      // Cập nhật house_id từ dữ liệu mới
      if (data.filters.house_id !== filters.house_id) {
        newFilters.house_id = data.filters.house_id || "";
        hasSignificantChanges = true;
      }
      
      // Chỉ khi có thay đổi đáng kể mới tải lại dữ liệu
      setFilters(newFilters);
      
      if (hasSignificantChanges) {
        loadUnpaidInvoices(1, newFilters);
        setCurrentPage(1); // Reset về trang 1 khi đổi bộ lọc
      }
    }
  }, [data?.filters]);

  // Function to load unpaid invoices
  const loadUnpaidInvoices = async (page, currentFilters) => {
    // Nếu đang loading, không gửi request mới
    if (loadingInvoices) return;
    
    try {
      setLoadingInvoices(true);
      
      const response = await statisticsService.getRevenueStats({
        ...currentFilters,
        page,
        per_page: perPage
      });
      
      if (response && response.success && response.data.unpaid_invoices) {
        const { data: invoices, total, last_page } = response.data.unpaid_invoices;
        setUnpaidInvoices(invoices || []);
        setTotalInvoices(total || 0);
        setLastPage(last_page || 1);
      }
    } catch (error) {
      console.error("Error loading unpaid invoices:", error);
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadUnpaidInvoices(page, filters);
  };

  // Lấy dataKey và định dạng xAxis dựa vào loại dữ liệu
  const getChartProps = () => {
    switch(revenueType) {
      case 'quarterly':
        return {
          dataKey: 'quarter',
          tickFormatter: (value) => `Quý ${value}`
        };
      case 'yearly':
        return {
          dataKey: 'year',
          tickFormatter: (value) => `${value}`
        };
      case 'date_range':
        return {
          dataKey: 'label',
          tickFormatter: (value) => value
        };
      case 'monthly':
      default:
        return {
          dataKey: 'month',
          tickFormatter: (value) => `Tháng ${value}`
        };
    }
  };
  
  const chartProps = getChartProps();

  return (
    <div className="row g-3">
      {/* Biểu đồ doanh thu */}
      <div className="col-md-8">
        <Card title={chartTitle}>
          <div style={{ height: "400px" }}>
            {Array.isArray(chartData) && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={chartProps.dataKey} tickFormatter={chartProps.tickFormatter} />
                  <YAxis tickFormatter={(value) => value.toLocaleString()} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#0088FE" name="Doanh thu (VND)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="alert alert-info">Không có dữ liệu doanh thu</div>
            )}
          </div>
        </Card>
      </div>

      {/* Biểu đồ tình trạng thanh toán */}
      <div className="col-md-4">
        <Card title="Tình trạng thanh toán">
          <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
            {paymentStatusData.length > 0 ? (
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
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="alert alert-info">Không có dữ liệu trạng thái thanh toán</div>
            )}
          </div>
          <div className="row text-center mt-3">
            <div className="col-4">
              <h5>{invoice_status ? (invoice_status.completed || 0).toLocaleString() : '0'}</h5>
              <p className="text-muted mb-0">Đã thanh toán</p>
            </div>
            <div className="col-4">
              <h5>{invoice_status ? (invoice_status.waiting || 0).toLocaleString() : '0'}</h5>
              <p className="text-muted mb-0">Chờ xác nhận</p>
            </div>
            <div className="col-4">
              <h5>{invoice_status ? (invoice_status.pending || 0).toLocaleString() : '0'}</h5>
              <p className="text-muted mb-0">Chờ thanh toán</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Danh sách hóa đơn chưa thanh toán */}
      <div className="col-md-12">
        <Card title="Danh sách hóa đơn chưa thanh toán">
          {loadingInvoices ? (
            <Loader />
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-bordered table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Mã hóa đơn</th>
                      <th>Phòng</th>
                      <th>Nhà</th>
                      <th>Người thuê</th>
                      <th>Tháng</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                      <th>Tổng tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(unpaidInvoices) && unpaidInvoices.length > 0 ? (
                      unpaidInvoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td>
                            <Link to={`/invoices/${invoice.id}`} target="_blank">
                              {invoice.id}
                            </Link>
                          </td>
                          <td>{invoice.room?.room_number || invoice.room_number}</td>
                          <td>{invoice.room?.house?.name || invoice.house_name}</td>
                          <td>{invoice.tenant ? `${invoice.tenant.name} (${invoice.tenant.phone_number})` : 'N/A'}</td>
                          <td>{invoice.month}/{invoice.year}</td>
                          <td>
                            <span className={`badge ${invoice.payment_status === 'pending' ? 'bg-warning' : 
                                                      invoice.payment_status === 'waiting' ? 'bg-info' : 
                                                      invoice.payment_status === 'completed' ? 'bg-success' : 
                                                      'bg-secondary'} text-white`}>
                              {invoice.payment_status === 'pending' ? 'Chờ thanh toán' : 
                               invoice.payment_status === 'waiting' ? 'Chờ xác nhận' : 
                               invoice.payment_status === 'completed' ? 'Đã thanh toán' : 
                               invoice.payment_status}
                            </span>
                          </td>
                          <td>{invoice.created_at}</td>
                          <td className="text-end">{formatCurrency(invoice.total_amount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">Không có hóa đơn chưa thanh toán</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Phân trang */}
              {totalInvoices > 0 && (
                <div className="d-flex justify-content-end mt-3">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={lastPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default RevenueStatistics; 