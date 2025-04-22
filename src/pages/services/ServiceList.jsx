import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { serviceService } from "../../api/services";
import Table from "../../components/common/Table";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

// Filter section component
const FilterSection = ({
  filters,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
}) => (
  <Card title="Bộ lọc" className="mb-3">
    <div className="row g-3">
      <div className="col-md-4">
        <Input
          label="Tên"
          name="name"
          value={filters.name}
          onChange={onFilterChange}
        />
      </div>
      <div className="col-md-4">
        <Input
          label="Đơn vị"
          name="unit"
          value={filters.unit}
          onChange={onFilterChange}
        />
      </div>
      <div className="col-md-4">
        <Select
          label="Được đo?"
          name="is_metered"
          value={filters.is_metered}
          onChange={onFilterChange}
          options={[
            { value: "1", label: "Có" },
            { value: "0", label: "Không" },
          ]}
        />
      </div>
    </div>

    <div className="mt-3 d-flex justify-content-end">
      <Button variant="secondary" onClick={onClearFilters} className="me-2">
        Xóa bộ lọc
      </Button>
      <Button onClick={onApplyFilters}>Tìm</Button>
    </div>
  </Card>
);

const ServiceList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  // Get current state from URL params
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 10;
  const sortBy = searchParams.get("sort_by") || "name";
  const sortDir = searchParams.get("sort_dir") || "asc";
  const name = searchParams.get("name") || "";
  const unit = searchParams.get("unit") || "";
  const isMetered = searchParams.get("is_metered") || "";

  // API hooks
  const {
    data: servicesData,
    loading: loadingServices,
    execute: fetchServices,
  } = useApi(serviceService.getServices);

  const { execute: deleteServiceApi } = useApi(serviceService.deleteService);

  // Derived state
  const services = servicesData?.data || [];
  const pagination = servicesData
    ? {
        current_page: servicesData.meta.current_page,
        last_page: servicesData.meta.last_page,
        total: servicesData.meta.total,
        per_page: servicesData.meta.per_page,
      }
    : null;

  // Table columns definition
  const columns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Tên" },
    {
      accessorKey: "default_price",
      header: "Giá mặc định",
      cell: ({ row }) => row.original.default_price?.toLocaleString(),
    },
    { accessorKey: "unit", header: "Đơn vị" },
    {
      accessorKey: "is_metered",
      header: "Được đo?",
      cell: ({ row }) => (row.original.is_metered ? "Có" : "Không"),
    },
    {
      accessorKey: "actions",
      header: "Hành động",
    },
  ];

  // Fetch data on initial load and when params change
  useEffect(() => {
    loadServices();
  }, [currentPage, perPage, sortBy, sortDir, name, unit, isMetered]);

  const loadServices = async () => {
    const params = {
      page: currentPage,
      per_page: perPage,
      sort_by: sortBy,
      sort_dir: sortDir,
    };

    // Add filters if they exist
    if (name) params.name = name;
    if (unit) params.unit = unit;
    if (isMetered !== "") params.is_metered = isMetered;

    const response = await fetchServices(params);
    if (!response.success) {
      showError(response.message || "Lỗi khi tải danh sách dịch vụ");
    }
  };

  const handleDeleteService = async (service) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
      const response = await deleteServiceApi(service.id);
      if (response.success) {
        showSuccess("Xóa dịch vụ thành công");
        // Reload data, potentially checking if current page becomes empty
        const newTotal = pagination.total - 1;
        const newLastPage = Math.ceil(newTotal / perPage);
        if (currentPage > newLastPage && newLastPage > 0) {
          handlePageChange(newLastPage); // Go to the new last page
        } else {
          loadServices(); // Reload current page
        }
      } else {
        showError(response.message || "Có lỗi xảy ra khi xóa dịch vụ");
      }
    }
  };

  // Update URL search params
  const updateSearchParams = (newParams) => {
    const currentParams = Object.fromEntries(searchParams);
    const updatedParams = { ...currentParams, ...newParams };

    // Remove empty params
    Object.keys(updatedParams).forEach((key) => {
      if (!updatedParams[key] && key !== "page") {
        delete updatedParams[key];
      }
    });
    // Reset page to 1 when filters change
    if (newParams.page === undefined) {
      updatedParams.page = "1";
    }

    setSearchParams(updatedParams);
  };

  const handlePageChange = (page) => {
    updateSearchParams({ page: page.toString() });
  };

  const handleSortingChange = (newSorting) => {
    if (newSorting?.length > 0) {
      const sort = newSorting[0];
      updateSearchParams({
        sort_by: sort.id,
        sort_dir: sort.desc ? "desc" : "asc",
      });
    } else {
      updateSearchParams({ sort_by: "name", sort_dir: "asc" });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    updateSearchParams({ [name]: value });
  };

  const clearFilters = () => {
    // Reset only filter params, keep sorting and per_page
    const paramsToKeep = {
      page: "1",
      per_page: perPage.toString(),
      sort_by: sortBy,
      sort_dir: sortDir,
    };
    setSearchParams(paramsToKeep);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3>Dịch vụ</h3>
        <Button as={Link} to="/services/create">
          Thêm
        </Button>
      </div>

      <FilterSection
        filters={{ name, unit, is_metered: isMetered }}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={loadServices}
      />

      <Card>
        {loadingServices ? (
          <Loader />
        ) : (
          <Table
            data={services}
            columns={columns}
            pagination={pagination}
            onPageChange={handlePageChange}
            manualSorting={true}
            sortingState={[{ id: sortBy, desc: sortDir === "desc" }]}
            onSortingChange={handleSortingChange}
            loading={loadingServices}
            actionColumn={{
              key: "actions",
              actions: [
                {
                  icon: "mdi-eye",
                  handler: (service) => navigate(`/services/${service.id}`),
                },
                {
                  icon: "mdi-pencil",
                  handler: (service) =>
                    navigate(`/services/${service.id}/edit`),
                },
                {
                  icon: "mdi-delete",
                  handler: handleDeleteService,
                },
              ],
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default ServiceList;
