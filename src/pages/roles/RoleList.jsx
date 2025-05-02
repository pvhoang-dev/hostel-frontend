import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { roleService } from "../../api/roles";
import Table from "../../components/common/Table";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
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
      <div className="col-md-6">
        <Input
          label="Mã vai trò"
          name="code"
          value={filters.code}
          onChange={onFilterChange}
        />
      </div>

      <div className="col-md-6">
        <Input
          label="Tên vai trò"
          name="name"
          value={filters.name}
          onChange={onFilterChange}
        />
      </div>
    </div>

    <div className="mt-3 d-flex justify-content-end">
      <Button
        variant="secondary"
        onClick={onClearFilters}
        className="me-2 mr-2"
      >
        Xóa bộ lọc
      </Button>
      <Button onClick={onApplyFilters}>Tìm</Button>
    </div>
  </Card>
);

const RoleList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  // Get current filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 10;
  const sortBy = searchParams.get("sort_by") || "id";
  const sortDir = searchParams.get("sort_dir") || "asc";
  const code = searchParams.get("code") || "";
  const name = searchParams.get("name") || "";

  // API hooks
  const {
    data: rolesData,
    loading: loadingRoles,
    execute: fetchRoles,
  } = useApi(roleService.getRoles);

  const { execute: deleteRole } = useApi(roleService.deleteRole);

  // Derived state
  const roles = rolesData?.data || [];
  const pagination = rolesData
    ? {
        current_page: rolesData.meta.current_page,
        last_page: rolesData.meta.last_page,
        total: rolesData.meta.total,
        per_page: rolesData.meta.per_page,
      }
    : null;

  // Column definitions for the table
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "code",
      header: "Mã",
    },
    {
      accessorKey: "name",
      header: "Tên",
    },
    {
      accessorKey: "actions",
      header: "Hành động",
    },
  ];

  useEffect(() => {
    loadRoles();
  }, [currentPage, perPage, sortBy, sortDir]);

  const loadRoles = async () => {
    const params = {
      page: currentPage,
      per_page: perPage,
      sort_by: sortBy,
      sort_dir: sortDir,
    };

    // Add filters if they exist
    if (code) params.code = code;
    if (name) params.name = name;

    const response = await fetchRoles(params);

    if (!response.success) {
      showError("Lỗi khi tải danh sách vai trò");
    }
  };

  const handleDeleteRole = async (role) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vai trò này?")) {
      const response = await deleteRole(role.id);

      if (response.success) {
        showSuccess("Xóa vai trò thành công");
        loadRoles();
      } else {
        showError(response.message || "Có lỗi xảy ra khi xóa vai trò");
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
    loadRoles();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3>Vai trò</h3>
        <Button as={Link} to="/roles/create">
          Thêm
        </Button>
      </div>

      <FilterSection
        filters={{ code, name }}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={loadRoles}
      />

      <Card>
        {loadingRoles ? (
          <Loader />
        ) : (
          <Table
            data={roles}
            columns={columns}
            pagination={pagination}
            onPageChange={handlePageChange}
            sortingState={[{ id: sortBy, desc: sortDir === "desc" }]}
            onSortingChange={handleSortingChange}
            loading={loadingRoles}
            actionColumn={{
              key: "actions",
              actions: [
                {
                  icon: "mdi-eye",
                  handler: (role) => navigate(`/roles/${role.id}`),
                },
                {
                  icon: "mdi-pencil",
                  handler: (role) => navigate(`/roles/${role.id}/edit`),
                },
                {
                  icon: "mdi-delete",
                  handler: handleDeleteRole,
                },
              ],
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default RoleList;
