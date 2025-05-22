import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import { dashboardService } from "../../api/dashboard";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    houses: 0,
    rooms: 0,
    tenants: 0,
    contracts: 0,
  });
  const [systemInfo, setSystemInfo] = useState({
    version: "1.0.0",
    server_time: new Date().toLocaleString(),
    status: "active",
  });

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    const fetchDashboardData = async () => {
      try {
        const response = await dashboardService.getStats();
        if (response.success) {
          setStats(response.data.stats);
          setSystemInfo(response.data.system_info);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="container-fluid py-3">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">Bảng thông tin</h3>
            <span className="badge bg-info text-white p-1">
              Xin chào, {user?.username || "Người dùng"}
            </span>
          </div>
          <hr className="my-2" />
        </div>
      </div>

      {/* Stat Cards */}
      {isAdmin && (
        <div className="row g-3 mb-4">
          <div className="col-md-6 col-xl-3">
            <div className="card widget-flat">
              <div className="card-body">
                <div className="float-right">
                  <i className="mdi mdi-account-multiple"></i>
                </div>
                <h5 className="text-muted fw-normal mt-0" title="Tổng số nhà">
                  Tổng số nhà
                </h5>
                <h3 className="mt-3 mb-3">{stats.houses}</h3>
                <p className="mb-0 text-muted">
                  <span className="text-success mr-2">
                    <i className="mdi mdi-arrow-up-bold"></i> 4.75%
                  </span>
                  <span className="text-nowrap">So với tháng trước</span>
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="card widget-flat">
              <div className="card-body">
                <div className="float-right">
                  <i className="mdi mdi-account-multiple"></i>
                </div>
                <h5 className="text-muted fw-normal mt-0" title="Tổng số phòng">
                  Tổng số phòng
                </h5>
                <h3 className="mt-3 mb-3">{stats.rooms}</h3>
                <p className="mb-0 text-muted">
                  <span className="text-success mr-2">
                    <i className="mdi mdi-arrow-up-bold"></i> 2.5%
                  </span>
                  <span className="text-nowrap">So với tháng trước</span>
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="card widget-flat">
              <div className="card-body">
                <div className="float-right">
                  <i className="mdi mdi-account-multiple"></i>
                </div>
                <h5
                  className="text-muted fw-normal mt-0"
                  title="Tổng số người thuê"
                >
                  Tổng số người thuê
                </h5>
                <h3 className="mt-3 mb-3">{stats.tenants}</h3>
                <p className="mb-0 text-muted">
                  <span className="text-danger mr-2">
                    <i className="mdi mdi-arrow-down-bold"></i> 1.08%
                  </span>
                  <span className="text-nowrap">So với tháng trước</span>
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="card widget-flat">
              <div className="card-body">
                <div className="float-right">
                  <i className="mdi mdi-account-multiple"></i>
                </div>
                <h5
                  className="text-muted fw-normal mt-0"
                  title="Tổng số hợp đồng"
                >
                  Tổng số hợp đồng
                </h5>
                <h3 className="mt-3 mb-3">{stats.contracts}</h3>
                <p className="mb-0 text-muted">
                  <span className="text-success mr-2">
                    <i className="mdi mdi-arrow-up-bold"></i> 3.25%
                  </span>
                  <span className="text-nowrap">So với tháng trước</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Info */}
      <div className="row">
        <div className="col-12">
          <Card title="Thông tin hệ thống">
            <div className="table-responsive">
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <td>Phiên bản</td>
                    <td className="text-end">{systemInfo.version}</td>
                  </tr>
                  <tr>
                    <td>Thời gian máy chủ</td>
                    <td className="text-end">{systemInfo.server_time}</td>
                  </tr>
                  <tr>
                    <td>Trạng thái</td>
                    <td className="text-end">
                      <span className="badge bg-success text-white p-1">
                        Hoạt động
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Vai trò</td>
                    <td className="text-end">{user?.role || "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
