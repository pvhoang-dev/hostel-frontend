import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { userService } from "../../api/users";
import { roleService } from "../../api/roles";
import Table from "../../components/common/Table";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { STATUS_OPTIONS } from "../../utils/constants";

// Component con hiển thị các action buttons
const ActionButtons = ({ user, onDelete }) => (
  <div className="flex space-x-2">
    <Link to={`/users/${user.id}`} className="text-blue-600 hover:underline">
      View
    </Link>
    <Link
      to={`/users/${user.id}/edit`}
      className="text-green-600 hover:underline"
    >
      Edit
    </Link>
    <button
      onClick={() => onDelete(user.id)}
      className="text-red-600 hover:underline"
    >
      Delete
    </button>
  </div>
);

// Component con hiển thị phần filter
const FilterSection = ({
  filters,
  roles,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
}) => (
  <Card title="Filters" className="mb-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Input
        label="Username"
        name="username"
        value={filters.username}
        onChange={onFilterChange}
      />

      <Input
        label="Name"
        name="name"
        value={filters.name}
        onChange={onFilterChange}
      />

      <Input
        label="Email"
        name="email"
        value={filters.email}
        onChange={onFilterChange}
      />

      <Select
        label="Role"
        name="role_id"
        value={filters.roleId}
        onChange={onFilterChange}
        options={[
          { value: "", label: "All Roles" },
          ...roles.map((role) => ({ value: role.id, label: role.name })),
        ]}
      />

      <Select
        label="Status"
        name="status"
        value={filters.status}
        onChange={onFilterChange}
        options={[
          { value: "", label: "All Statuses" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ]}
      />
    </div>

    <div className="mt-4 flex justify-end">
      <Button variant="secondary" onClick={onClearFilters} className="mr-2">
        Clear Filters
      </Button>
      <Button onClick={onApplyFilters}>Apply Filters</Button>
    </div>
  </Card>
);

const UserList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  // Get current filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 5;
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
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role.name",
      header: "Role",
      cell: ({ row }) => row.original.role?.name || "No Role",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={
            row.original.status === "active" ? "text-green-600" : "text-red-600"
          }
        >
          {row.original.status || "Unknown"}
        </span>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionButtons user={row.original} onDelete={handleDeleteUser} />
      ),
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
    username,
    name,
    email,
    roleId,
    status,
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
      showError("Failed to load users");
    }
  };

  const loadRoles = async () => {
    await fetchRoles();
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const response = await deleteUser(id);

      if (response.success) {
        showSuccess("User deleted successfully");
        loadUsers();
      } else {
        showError(response.message || "Failed to delete user");
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

  const isLoading = loadingUsers || loadingRoles;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Button as={Link} to="/users/create">
          Add User
        </Button>
      </div>

      <FilterSection
        filters={{ username, name, email, roleId, status }}
        roles={roles}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={loadUsers}
      />

      <Card>
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
          />
        )}
      </Card>
    </div>
  );
};

export default UserList;
