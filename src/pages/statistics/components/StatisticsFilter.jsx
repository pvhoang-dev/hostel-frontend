import React, { useState, useEffect } from "react";
import Select from "../../../components/ui/Select";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { houseService } from "../../../api/houses";

const StatisticsFilter = ({ onFilterChange }) => {
  const [houses, setHouses] = useState([]);
  const [filters, setFilters] = useState({
    house_id: "",
    date_from: "",
    date_to: "",
    period: "monthly", // monthly, quarterly, yearly
  });
  const [loading, setLoading] = useState(false);

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

  // Xử lý thay đổi giá trị lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Áp dụng bộ lọc
  const applyFilters = () => {
    onFilterChange(filters);
  };

  // Xóa bộ lọc
  const clearFilters = () => {
    const resetFilters = {
      house_id: "",
      date_from: "",
      date_to: "",
      period: "monthly",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
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

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="row g-3">
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
          <div className="col-md-3">
            <Input
              type="date"
              label="Từ ngày"
              name="date_from"
              value={filters.date_from}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-md-3">
            <Input
              type="date"
              label="Đến ngày"
              name="date_to"
              value={filters.date_to}
              onChange={handleFilterChange}
            />
          </div>
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
          <div className="col-12 text-end">
            <Button
              variant="secondary"
              className="me-2"
              onClick={clearFilters}
              disabled={loading}
            >
              Xóa bộ lọc
            </Button>
            <Button
              variant="primary"
              onClick={applyFilters}
              disabled={loading}
            >
              Áp dụng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsFilter; 