import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { houseService } from "../../api/houses";
import { userService } from "../../api/users";
import Table from "../../components/common/Table";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";

// Component con hiển thị phần filter
const FilterSection = ({
  filters,
  managers,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
}) => (
  <Card title="Bộ lọc" className="mb-3">
    <div className="row g-3">
      <div className="col-md-4">
        <Input
          label="Tên nhà"
          name="name"
          value={filters.name}
          onChange={onFilterChange}
        />
      </div>

      <div className="col-md-4">
        <Input
          label="Địa chỉ"
          name="address"
          value={filters.address}
          onChange={onFilterChange}
        />
      </div>

      <div className="col-md-4">
        <Select
          label="Quản lý"
          name="manager_id"
          value={filters.manager_id}
          onChange={onFilterChange}
          options={[
            { value: "", label: "Tất cả" },
            ...managers.map((user) => ({ value: user.id, label: user.name })),
          ]}
        />
      </div>

      <div className="col-md-4">
        <Select
          label="Trạng thái"
          name="status"
          value={filters.status}
          onChange={onFilterChange}
          options={[
            { value: "", label: "Tất cả" },
            { value: "active", label: "Hoạt động" },
            { value: "inactive", label: "Không hoạt động" },
            { value: "maintenance", label: "Bảo trì" },
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

const HouseList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  // Get current filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 5;
  const sortBy = searchParams.get("sort_by") || "id";
  const sortDir = searchParams.get("sort_dir") || "asc";
  const name = searchParams.get("name") || "";
  const address = searchParams.get("address") || "";
  const manager_id = searchParams.get("manager_id") || "";
  const status = searchParams.get("status") || "";

  // API hooks
  const {
    data: housesData,
    loading: loadingHouses,
    execute: fetchHouses,
  } = useApi(houseService.getHouses);

  const {
    data: managersData,
    loading: loadingManagers,
    execute: fetchManagers,
  } = useApi(userService.getUsers);

  const { execute: deleteHouse } = useApi(houseService.deleteHouse);

  // Derived state
  const houses = housesData?.data || [];
  const pagination = housesData
    ? {
        current_page: housesData.meta.current_page,
        last_page: housesData.meta.last_page,
        total: housesData.meta.total,
        per_page: housesData.meta.per_page,
      }
    : null;

  const managers = managersData?.data || [];

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Column definitions for the table
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Tên nhà",
    },
    {
      accessorKey: "address",
      header: "Địa chỉ",
    },
    {
      accessorKey: "manager.name",
      header: "Quản lý",
      cell: ({ row }) => row.original.manager?.name || "Chưa có quản lý",
    },
    {
      accessorKey: "status",
      header: "T.Thái",
      cell: ({ row }) => {
        const status = row.original.status;
        let statusClass;

        switch (status) {
          case "active":
            statusClass = "text-success";
            return <span className={statusClass}>Hoạt động</span>;
          case "maintenance":
            statusClass = "text-warning";
            return <span className={statusClass}>Bảo trì</span>;
          default:
            statusClass = "text-danger";
            return <span className={statusClass}>Không hoạt động</span>;
        }
      },
    },
    {
      accessorKey: "created_at",
      header: "Ngày tạo",
    },
    {
      accessorKey: "actions",
      header: "Hành động",
    },
  ];

  useEffect(() => {
    loadHouses();
    loadManagers();
  }, []);

  useEffect(() => {
    if (!loadingManagers && !loadingHouses) {
      loadHouses();
    }
  }, [
    currentPage,
    perPage,
    sortBy,
    sortDir,
    name,
    address,
    manager_id,
    status,
  ]);

  const loadHouses = async () => {
    const params = {
      page: currentPage,
      per_page: perPage,
      sort_by: sortBy,
      sort_dir: sortDir,
      include: "manager",
    };

    // Add filters if they exist
    if (name) params.name = name;
    if (address) params.address = address;
    if (manager_id) params.manager_id = manager_id;
    if (status) params.status = status;

    const response = await fetchHouses(params);

    if (!response.success) {
      showError("Lỗi khi tải danh sách nhà");
    }
  };

  const loadManagers = async () => {
    await fetchManagers({ role: "admin,manager" });
  };

  const handleDeleteHouse = async (house) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhà này?")) {
      const response = await deleteHouse(house.id);

      if (response.success) {
        showSuccess("Xóa nhà thành công");
        loadHouses();
      } else {
        showError(response.message || "Có lỗi xảy ra khi xóa nhà");
      }
    }
  };

  const handlePageChange = (page) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: page.toString(),
    });
  };

  const handleSortingChange = (sorting) => {
    if (sorting.length > 0) {
      setSearchParams({
        ...Object.fromEntries(searchParams),
        sort_by: sorting[0].id,
        sort_dir: sorting[0].desc ? "desc" : "asc",
      });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    const newParams = { ...Object.fromEntries(searchParams), page: "1" };

    if (value) {
      newParams[name] = value;
    } else {
      delete newParams[name];
    }

    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({
      page: "1",
      per_page: perPage.toString(),
    });
  };

  const isLoading = loadingHouses || loadingManagers;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Nhà</h3>
        {isAdmin && (
          <Button as={Link} to="/houses/create">
            Thêm
          </Button>
        )}
      </div>

      <FilterSection
        filters={{ name, address, manager_id, status }}
        managers={managers}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={loadHouses}
      />

      <Card>
        {isLoading ? (
          <Loader />
        ) : (
          <Table
            data={houses}
            columns={columns}
            pagination={pagination}
            onPageChange={handlePageChange}
            sortingState={[{ id: sortBy, desc: sortDir === "desc" }]}
            onSortingChange={handleSortingChange}
            loading={isLoading}
            actionColumn={{
              key: "actions",
              actions: [
                {
                  icon: "mdi-eye",
                  handler: (house) => navigate(`/houses/${house.id}`),
                },
                {
                  icon: "mdi-pencil",
                  handler: (house) => navigate(`/houses/${house.id}/edit`),
                },
                ...(isAdmin
                  ? [
                      {
                        icon: "mdi-delete",
                        handler: handleDeleteHouse,
                      },
                    ]
                  : []),
              ],
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default HouseList;
