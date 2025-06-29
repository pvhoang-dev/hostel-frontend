import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { userService } from "../../api/users";
import { roleService } from "../../api/roles";
import Table from "../../components/ui/Table";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Loader from "../../components/ui/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

// Component con hiển thị phần filter
const FilterSection = ({
  filters,
  roles,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
}) => (
  <Card title="Bộ lọc" className="mb-3">
    <div className="row g-3">
      <div className="col-md-4">
        <Input
          label="Username"
          name="username"
          value={filters.username}
          onChange={onFilterChange}
        />
      </div>

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
          label="Email"
          name="email"
          value={filters.email}
          onChange={onFilterChange}
        />
      </div>

      <div className="col-md-4">
        <Select
          label="Vai trò"
          name="role_id"
          value={filters.role_id}
          onChange={onFilterChange}
          options={[
            { value: "", label: "Tất cả" },
            ...roles.map((role) => ({ value: role.id, label: role.name })),
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
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
      </div>
    </div>

    <div className="mt-3 d-flex justify-content-end">
      <Button variant="secondary" onClick={onClearFilters} className=" mr-2">
        Xóa bộ lọc
      </Button>
      <Button onClick={onApplyFilters}>Tìm</Button>
    </div>
  </Card>
);

const UserList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  // Get current filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 10;
  const sortBy = searchParams.get("sort_by") || "id";
  const sortDir = searchParams.get("sort_dir") || "asc";
  const username = searchParams.get("username") || "";
  const name = searchParams.get("name") || "";
  const email = searchParams.get("email") || "";
  const roleId = searchParams.get("role_id") || "";
  const status = searchParams.get("status") || "";

  // API hooks
  const {
    data: usersData,
    loading: loadingUsers,
    execute: fetchUsers,
  } = useApi(userService.getUsers);

  const {
    data: rolesData,
    loading: loadingRoles,
    execute: fetchRoles,
  } = useApi(roleService.getRoles);

  const { execute: deleteUser } = useApi(userService.deleteUser);

  // Derived state
  const users = usersData?.data || [];
  const pagination = usersData
    ? {
        current_page: usersData.meta.current_page,
        last_page: usersData.meta.last_page,
        total: usersData.meta.total,
        per_page: usersData.meta.per_page,
      }
    : null;

  const roles = rolesData?.data || [];

  // Column definitions for the table
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "name",
      header: "Tên",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role.name",
      header: "Vai trò",
      cell: ({ row }) => row.original.role?.name || "None",
    },
    {
      accessorKey: "status",
      header: "T.Thái",
      cell: ({ row }) => (
        <span
          className={
            row.original.status === "active" ? "text-success" : "text-danger"
          }
        >
          {row.original.status || "None"}
        </span>
      ),
    },
    {
      accessorKey: "actions",
      header: "Hành động",
    },
  ];

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  useEffect(() => {
    if (!loadingRoles && !loadingUsers) {
      loadUsers();
    }
  }, [
    currentPage,
    perPage,
    sortBy,
    sortDir,
    roleId,
    status,
    username,
    name,
    email,
  ]);

  const loadUsers = async () => {
    const params = {
      page: currentPage,
      per_page: perPage,
      sort_by: sortBy,
      sort_dir: sortDir,
    };

    // Add filters if they exist
    if (username) params.username = username;
    if (name) params.name = name;
    if (email) params.email = email;
    if (roleId) params.role_id = roleId;
    if (status) params.status = status;

    const response = await fetchUsers(params);

    if (!response.success) {
      showError("Lỗi khi tải danh sách người dùng");
    }
  };

  const loadRoles = async () => {
    await fetchRoles();
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      const response = await deleteUser(user.id);

      if (response.success) {
        showSuccess("Xóa người dùng thành công");
        loadUsers();
      } else {
        showError(response.message || "Có lỗi xảy ra khi xóa người dùng");
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
    // Only keep page and per_page parameters
    setSearchParams({
      page: "1",
      per_page: perPage.toString(),
    });
    // Don't call loadUsers() here - let the useEffect handle it
  };

  const isLoading = loadingUsers || loadingRoles;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3>Users</h3>
        <Button as={Link} to="/users/create">
          Thêm
        </Button>
      </div>

      <FilterSection
        filters={{
          username,
          name,
          email,
          role_id: roleId,
          status,
        }}
        roles={roles}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={loadUsers}
      />

      <Card title="Người dùng">
        {isLoading ? (
          <Loader />
        ) : (
          <Table
            data={users}
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
                  handler: (user) => navigate(`/users/${user.id}`),
                },
                {
                  icon: "mdi-pencil",
                  handler: (user) => navigate(`/users/${user.id}/edit`),
                },
                {
                  icon: "mdi-delete",
                  handler: handleDeleteUser,
                },
              ],
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default UserList;
