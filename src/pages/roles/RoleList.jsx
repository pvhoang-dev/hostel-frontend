import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { roleService } from "../../api/roles";
import Table from "../../components/common/Table";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

// Action buttons component
const ActionButtons = ({ role, onDelete }) => (
  <div className="flex space-x-2">
    <Link to={`/roles/${role.id}`} className="text-blue-600 hover:underline">
      Xem
    </Link>
    <Link
      to={`/roles/${role.id}/edit`}
      className="text-green-600 hover:underline"
    >
      Sửa
    </Link>
    <button
      onClick={() => onDelete(role.id)}
      className="text-red-600 hover:underline"
    >
      Xóa
    </button>
  </div>
);

// Filter section component
const FilterSection = ({
  filters,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
}) => (
  <Card title="Bộ lọc" className="mb-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Mã vai trò"
        name="code"
        value={filters.code}
        onChange={onFilterChange}
      />

      <Input
        label="Tên vai trò"
        name="name"
        value={filters.name}
        onChange={onFilterChange}
      />
    </div>

    <div className="mt-4 flex justify-end">
      <Button variant="secondary" onClick={onClearFilters} className="mr-2">
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
      cell: ({ row }) => (
        <ActionButtons role={row.original} onDelete={handleDeleteRole} />
      ),
    },
  ];

  useEffect(() => {
    loadRoles();
  }, [currentPage, perPage, sortBy, sortDir, code, name]);

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

  const handleDeleteRole = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vai trò này?")) {
      const response = await deleteRole(id);

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
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Vai trò</h1>
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
          />
        )}
      </Card>
    </div>
  );
};

export default RoleList;
