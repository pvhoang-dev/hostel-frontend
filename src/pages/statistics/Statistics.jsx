import React, { useState, useEffect } from "react";
import { Tab, Nav } from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth";
import { statisticsService } from "../../api/statistics";
import Loader from "../../components/ui/Loader";
import useAlert from "../../hooks/useAlert";

// Import các components
import StatisticsFilter from "./components/StatisticsFilter";
import OverviewStatistics from "./components/OverviewStatistics";
import ContractsStatistics from "./components/ContractsStatistics";
import RevenueStatistics from "./components/RevenueStatistics";
import ServicesStatistics from "./components/ServicesStatistics";
import EquipmentStatistics from "./components/EquipmentStatistics";
import ExportReport from "./components/ExportReport";

const Statistics = () => {
  const { user, isAdmin } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState({
    house_id: "",
    date_from: "",
    date_to: "",
    period: "monthly",
  });
  
  const [loading, setLoading] = useState({
    overview: false,
    contracts: false,
    revenue: false,
    services: false,
    equipment: false,
  });
  
  const [data, setData] = useState({
    overview: null,
    contracts: null,
    revenue: null,
    services: null,
    equipment: null,
  });

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Tải lại dữ liệu cho tab hiện tại
    loadData(activeTab, newFilters);
  };

  // Xử lý thay đổi tab
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    // Chỉ tải dữ liệu nếu tab chưa có dữ liệu
    if (!data[tabKey]) {
      loadData(tabKey, filters);
    }
  };

  // Tải dữ liệu thống kê
  const loadData = async (tabKey, currentFilters) => {
    try {
      setLoading((prev) => ({ ...prev, [tabKey]: true }));
      
      let response;
      switch (tabKey) {
        case "overview":
          response = await statisticsService.getOverview(currentFilters);
          break;
        case "contracts":
          response = await statisticsService.getContractsStats(currentFilters);
          break;
        case "revenue":
          response = await statisticsService.getRevenueStats(currentFilters);
          break;
        case "services":
          response = await statisticsService.getServicesStats(currentFilters);
          break;
        case "equipment":
          response = await statisticsService.getEquipmentStats(currentFilters);
          break;
        case "export":
          // Tab xuất báo cáo không cần tải dữ liệu
          setLoading((prev) => ({ ...prev, [tabKey]: false }));
          return;
        default:
          return;
      }
      
      if (response && response.success) {
        setData((prev) => ({ ...prev, [tabKey]: response.data }));
      } else {
        showError(response?.message || `Có lỗi xảy ra khi tải dữ liệu ${tabKey}`);
        // Đặt dữ liệu thành null để tránh hiển thị dữ liệu cũ
        setData((prev) => ({ ...prev, [tabKey]: null }));
      }
    } catch (error) {
      console.error(`Lỗi khi tải dữ liệu ${tabKey}:`, error);
      showError(`Có lỗi xảy ra khi tải dữ liệu ${tabKey}`);
      // Đặt dữ liệu thành null khi có lỗi
      setData((prev) => ({ ...prev, [tabKey]: null }));
    } finally {
      setLoading((prev) => ({ ...prev, [tabKey]: false }));
    }
  };

  // Tải dữ liệu ban đầu khi component được mount
  useEffect(() => {
    loadData("overview", filters);
  }, []);

  return (
    <div className="container-fluid py-3">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">Thống kê</h3>
            <span className="badge bg-info text-white p-1">
              Xin chào, {user?.username || "Người dùng"}
            </span>
          </div>
          <hr className="my-2" />
        </div>
      </div>

      {/* Bộ lọc */}
      <StatisticsFilter onFilterChange={handleFilterChange} />

      {/* Tab thống kê */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <Tab.Container activeKey={activeTab} onSelect={handleTabChange}>
                <Nav variant="tabs" className="nav-bordered mb-3">
                  <Nav.Item>
                    <Nav.Link eventKey="overview">Tổng quan</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="contracts">Hợp đồng</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="revenue">Doanh thu</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="services">Dịch vụ</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="equipment">Thiết bị</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="export">Xuất báo cáo</Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  <Tab.Pane eventKey="overview">
                    {loading.overview ? (
                      <Loader />
                    ) : (
                      <OverviewStatistics data={data.overview} />
                    )}
                  </Tab.Pane>
                  <Tab.Pane eventKey="contracts">
                    {loading.contracts ? (
                      <Loader />
                    ) : (
                      <ContractsStatistics data={data.contracts} />
                    )}
                  </Tab.Pane>
                  <Tab.Pane eventKey="revenue">
                    {loading.revenue ? (
                      <Loader />
                    ) : (
                      <RevenueStatistics data={data.revenue} />
                    )}
                  </Tab.Pane>
                  <Tab.Pane eventKey="services">
                    {loading.services ? (
                      <Loader />
                    ) : (
                      <ServicesStatistics data={data.services} />
                    )}
                  </Tab.Pane>
                  <Tab.Pane eventKey="equipment">
                    {loading.equipment ? (
                      <Loader />
                    ) : (
                      <EquipmentStatistics data={data.equipment} />
                    )}
                  </Tab.Pane>
                  <Tab.Pane eventKey="export">
                    <ExportReport filters={filters} />
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics; 