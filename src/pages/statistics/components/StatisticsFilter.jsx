import React, { useState, useEffect, useCallback } from "react";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import { houseService } from "../../../api/houses";

const StatisticsFilter = ({ onFilterChange, activeTab }) => {
  const [houses, setHouses] = useState([]);
  const [filters, setFilters] = useState({
    house_id: "",
    house_name: "",
    period: "monthly", // monthly, quarterly, yearly
    filter_type: "period", // Chỉ giữ loại "period"
    month: new Date().getMonth() + 1, // Tháng hiện tại
    year: new Date().getFullYear(), // Năm hiện tại
    quarter: Math.floor(new Date().getMonth() / 3) + 1, // Quý hiện tại (1-4)
  });
  const [loading, setLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  // Lấy danh sách nhà
  useEffect(() => {
    const fetchHouses = async () => {
      try {
        setLoading(true);
        const response = await houseService.getHouses();
        if (response.success) {
          // Kiểm tra cấu trúc dữ liệu phản hồi
          const housesData = response.data.data || [];
          setHouses(housesData);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhà:", error);
        setHouses([]); // Đặt mảng rỗng để tránh lỗi map()
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
  }, []);

  // Hàm debounce để trì hoãn việc gọi onFilterChange
  const debouncedFilterChange = useCallback((newFilters) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    const timeout = setTimeout(() => {
      onFilterChange(newFilters);
    }, 300); // Chờ 300ms sau khi người dùng dừng thay đổi filter
    
    setDebounceTimeout(timeout);
  }, [debounceTimeout, onFilterChange]);

  // Xử lý thay đổi giá trị lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    let updatedFilters = { ...filters };
    
    // Xử lý thay đổi kỳ báo cáo, cập nhật giá trị tương ứng
    if (name === 'period') {
      updatedFilters = {
        ...updatedFilters,
        [name]: value,
        // Đặt lại giá trị mặc định khi thay đổi loại kỳ
        month: value === 'monthly' ? new Date().getMonth() + 1 : filters.month,
        quarter: value === 'quarterly' ? Math.floor(new Date().getMonth() / 3) + 1 : filters.quarter,
        // Khi chọn "yearly", không cần chọn năm cụ thể
        year: value !== 'yearly' ? filters.year : new Date().getFullYear()
      };
    }
    // If changing house_id, also update house_name
    else if (name === 'house_id') {
      const selectedHouse = houses.find(house => house.id === Number(value));
      updatedFilters = {
        ...updatedFilters,
        [name]: value,
        house_name: selectedHouse ? selectedHouse.name : ''
      };
    } 
    else {
      updatedFilters = {
        ...updatedFilters,
        [name]: value,
      };
    }
    
    // Update local state
    setFilters(updatedFilters);
    
    // Sử dụng debounce để trì hoãn việc gọi onFilterChange
    debouncedFilterChange(updatedFilters);
  };

  // Xóa bộ lọc
  const clearFilters = () => {
    const resetFilters = {
      house_id: "",
      house_name: "",
      period: "monthly",
      filter_type: "period",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      quarter: Math.floor(new Date().getMonth() / 3) + 1,
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters); // Gọi ngay lập tức khi xóa bộ lọc
  };

  // Danh sách nhà cho select
  const houseOptions = Array.isArray(houses) ? houses.map((house) => ({
    value: house.id,
    label: house.name,
  })) : [];

  // Thêm tùy chọn "Tất cả nhà"
  houseOptions.unshift({ value: "", label: "Tất cả nhà" });

  // Danh sách kỳ thống kê
  const periodOptions = [
    { value: "monthly", label: "Theo tháng" },
    { value: "quarterly", label: "Theo quý" },
    { value: "yearly", label: "Theo năm" },
  ];

  // Tạo các options cho tháng, quý và năm
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `Tháng ${i + 1}`
  }));

  const quarterOptions = Array.from({ length: 4 }, (_, i) => ({
    value: i + 1,
    label: `Quý ${i + 1}`
  }));

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear - i,
    label: `Năm ${currentYear - i}`
  }));

  // Kiểm tra xem có phải đang ở tab overview không
  const isOverviewTab = activeTab === "overview";
  const isContractsTab = activeTab === "contracts";
  const isRevenueTab = activeTab === "revenue";

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="row g-3">
          {/* Bộ lọc nhà - hiển thị ở mọi tab */}
          <div className="col-md-3">
            <Select
              label="Nhà"
              name="house_id"
              value={filters.house_id}
              onChange={handleFilterChange}
              options={houseOptions}
              placeholder="Chọn nhà"
            />
          </div>
          
          {/* Nếu là tab doanh thu, hiển thị bộ lọc kỳ */}
          {isRevenueTab && (
            <>
              <div className="col-md-3">
                <Select
                  label="Loại kỳ"
                  name="period"
                  value={filters.period}
                  onChange={handleFilterChange}
                  options={periodOptions}
                  placeholder="Chọn loại kỳ"
                />
              </div>

              {/* Chỉ hiển thị chọn năm khi không phải là theo năm */}
              {filters.period !== "yearly" && (
                <div className="col-md-3">
                  <Select
                    label="Năm"
                    name="year"
                    value={filters.year}
                    onChange={handleFilterChange}
                    options={yearOptions}
                    placeholder="Chọn năm"
                  />
                </div>
              )}
            </>
          )}
          
          {/* Show period filter on contracts tab */}
          {isContractsTab && (
            <div className="col-md-3">
              <Select
                label="Kỳ thống kê"
                name="period"
                value={filters.period}
                onChange={handleFilterChange}
                options={periodOptions}
                placeholder="Chọn kỳ thống kê"
              />
            </div>
          )}
          
          <div className="col-12 text-end">
            <Button
              variant="secondary"
              className="me-2 float-right"
              onClick={clearFilters}
              disabled={loading}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsFilter; 