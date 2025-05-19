import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { notificationService } from "../../api/notifications";
import { userService } from "../../api/users";
import Table from "../../components/ui/Table";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Loader from "../../components/ui/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";

// Component con hiển thị phần filter
const FilterSection = ({
  filters,
  users,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  hideUserFilter = false,
  canViewOthers = false,
}) => (
  <Card title="Bộ lọc" className="mb-3">
    <div className="row g-3">
      {canViewOthers && (
        <div className="col-md-6">
          <Select
            label="Xem thông báo"
            name="viewAll"
            value={filters.viewAll}
            onChange={onFilterChange}
            options={[
              { value: "", label: "Chỉ của tôi" },
              { value: "true", label: "Tất cả" },
            ]}
          />
        </div>
      )}

      {canViewOthers && !hideUserFilter && (
        <div className="col-md-6">
          <Select
            label="Người dùng"
            name="user_id"
            value={filters.user_id}
            onChange={onFilterChange}
            options={[
              { value: "", label: "Tất cả" },
              ...users.map((user) => ({
                value: user.id,
                label: user.name,
              })),
            ]}
          />
        </div>
      )}

      <div className="col-md-6">
        <Select
          label="Trạng thái"
          name="is_read"
          value={filters.is_read}
          onChange={onFilterChange}
          options={[
            { value: "", label: "Tất cả" },
            { value: "false", label: "Chưa đọc" },
            { value: "true", label: "Đã đọc" },
          ]}
        />
      </div>

      <div className="col-md-6">
        <Select
          label="Loại thông báo"
          name="type"
          value={filters.type}
          onChange={onFilterChange}
          options={[
            { value: "", label: "Tất cả" },
            { value: "info", label: "Thông tin" },
            { value: "warning", label: "Cảnh báo" },
            { value: "success", label: "Thành công" },
            { value: "danger", label: "Nguy hiểm" },
            { value: "request", label: "Yêu cầu" },
          ]}
        />
      </div>

      <div className="col-md-6">
        <Input
          type="date"
          label="Từ ngày"
          name="created_from"
          value={filters.created_from}
          onChange={onFilterChange}
        />
      </div>

      <div className="col-md-6">
        <Input
          type="date"
          label="Đến ngày"
          name="created_to"
          value={filters.created_to}
          onChange={onFilterChange}
        />
      </div>
    </div>

    <div className="mt-3 d-flex justify-content-end">
      <Button
        variant="secondary"
        onClick={onClearFilters}
        className=" mr-2"
      >
        Xóa bộ lọc
      </Button>
      <Button onClick={onApplyFilters}>Tìm</Button>
    </div>
  </Card>
);

const NotificationList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();

  const canViewOthers = isAdmin || isManager;
  const canCreateNotifications = isAdmin || isManager;

  // Get current filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 10;
  const sortBy = searchParams.get("sort_by") || "id";
  const sortDir = searchParams.get("sort_dir") || "desc";
  const viewAll = searchParams.get("viewAll") || "";
  const user_id = searchParams.get("user_id") || "";
  const is_read = searchParams.get("is_read") || "";
  const type = searchParams.get("type") || "";
  const created_from = searchParams.get("created_from") || "";
  const created_to = searchParams.get("created_to") || "";

  // Set default sorting if not specified in URL
  useEffect(() => {
    if (!searchParams.has("sort_by") || !searchParams.has("sort_dir")) {
      setSearchParams({
        ...Object.fromEntries(searchParams),
        sort_by: "id",
        sort_dir: "desc",
      });
    }
  }, []);

  // API hooks
  const {
    data: notificationsData,
    loading: loadingNotifications,
    execute: fetchNotifications,
  } = useApi(notificationService.getNotifications);

  const {
    data: usersData,
    loading: loadingUsers,
    execute: fetchUsers,
  } = useApi(userService.getUsers);

  const { execute: deleteNotification } = useApi(
    notificationService.deleteNotification
  );

  // Derived state
  const notifications = notificationsData?.data || [];
  const pagination = notificationsData
    ? {
        current_page: notificationsData.meta.current_page,
        last_page: notificationsData.meta.last_page,
        total: notificationsData.meta.total,
        per_page: notificationsData.meta.per_page,
      }
    : null;

  const users = usersData?.data || [];

  // Column definitions for the table
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
    },
    ...(canViewOthers
      ? [
          {
            accessorKey: "user.name",
            header: "Người nhận",
            cell: ({ row }) => row.original.user?.name || "N/A",
          },
        ]
      : []),
    {
      accessorKey: "type",
      header: "Loại",
      cell: ({ row }) => {
        const type = row.original.type;
        let typeText, badgeClass;

        switch (type) {
          case "info":
            typeText = "Thông tin";
            badgeClass = "bg-info";
            break;
          case "warning":
            typeText = "Cảnh báo";
            badgeClass = "bg-warning";
            break;
          case "success":
            typeText = "Thành công";
            badgeClass = "bg-success";
            break;
          case "danger":
            typeText = "Nguy hiểm";
            badgeClass = "bg-danger";
            break;
          case "request":
            typeText = "Yêu cầu";
            badgeClass = "bg-primary";
            break;
          default:
            typeText = type;
            badgeClass = "bg-secondary";
        }

        return (
          <span className={`badge ${badgeClass} text-white`}>{typeText}</span>
        );
      },
    },
    {
      accessorKey: "content",
      header: "Nội dung",
      cell: ({ row }) => {
        const content = row.original.content;
        return (
          <div className="text-truncate" style={{ maxWidth: "250px" }}>
            {content}
          </div>
        );
      },
    },
    {
      accessorKey: "is_read",
      header: "Trạng thái",
      cell: ({ row }) => {
        const isRead = row.original.is_read;
        return isRead ? (
          <span className="badge bg-success text-white">Đã đọc</span>
        ) : (
          <span className="badge bg-warning text-white">Chưa đọc</span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Ngày tạo",
      sortingFn: "datetime",
      sortDescFirst: true,
    },
    {
      accessorKey: "actions",
      header: "Hành động",
    },
  ];

  useEffect(() => {
    if (user) {
      loadNotifications();
      if (canViewOthers) {
        loadUsers();
      }
    }
  }, [user, canViewOthers]);

  useEffect(() => {
    if (user && !loadingNotifications) {
      loadNotifications();
    }
  }, [
    currentPage,
    perPage,
    sortBy,
    sortDir,
    viewAll,
    user_id,
    is_read,
    type,
    created_from,
    created_to,
    user,
  ]);

  const loadNotifications = async () => {
    const params = {
      page: currentPage,
      per_page: perPage,
      sort_by: sortBy,
      sort_dir: sortDir,
      include: "user",
    };

    // For admin and manager, always view all notifications by default
    if (canViewOthers) {
      params.viewAll = "true";
    } else if (viewAll) {
      params.viewAll = viewAll;
    }

    // Add other filters if they exist
    if (user_id) params.user_id = user_id;
    if (is_read) params.is_read = is_read;
    if (type) params.type = type;
    if (created_from) params.created_from = created_from;
    if (created_to) params.created_to = created_to;

    try {
      const response = await fetchNotifications(params);

      if (!response.success) {
        showError("Lỗi khi tải danh sách thông báo");
      }
    } catch (error) {
      showError("Lỗi khi tải danh sách thông báo");
    }
  };

  const loadUsers = async () => {
    // For managers, only show their managed users
    const params = isManager ? { managed_by: user.id } : {};
    await fetchUsers(params);
  };

  const handleDeleteNotification = async (notification) => {
    // Check permissions: Admin can delete any, Manager can delete their own or their tenants', others only their own
    if (!(isAdmin || isManager || notification.user_id === user.id)) {
      showError("Bạn không có quyền xóa thông báo này");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa thông báo này?")) {
      try {
        const response = await deleteNotification(notification.id);

        if (response.success) {
          showSuccess("Xóa thông báo thành công");
          loadNotifications();
        } else {
          showError(response.message || "Có lỗi xảy ra khi xóa thông báo");
        }
      } catch (error) {
        showError("Có lỗi xảy ra khi xóa thông báo");
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // If a specific user is selected and the current user is admin or manager, mark that user's notifications as read
      const params = {};
      if (user_id && (isAdmin || isManager)) {
        params.user_id = user_id;
      }

      const response = await notificationService.markAllAsRead(params);
      if (response.success) {
        showSuccess("Đã đánh dấu tất cả thông báo là đã đọc");
        loadNotifications();
      } else {
        showError("Không thể đánh dấu thông báo là đã đọc");
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi đánh dấu thông báo");
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
        page: "1", // Reset to first page on sorting change
      });
    } else {
      // Default to created_at desc if no sorting specified
      setSearchParams({
        ...Object.fromEntries(searchParams),
        sort_by: "created_at",
        sort_dir: "desc",
        page: "1",
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
    loadNotifications();
  };

  const isLoading = loadingNotifications || (loadingUsers && canViewOthers);

  // Nếu chưa có thông tin user, hiển thị loading
  if (!user) {
    return <Loader />;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3>Thông báo</h3>
        <div>
          <Button
            variant="secondary"
            onClick={handleMarkAllAsRead}
            className=" mr-2"
          >
            Đánh dấu tất cả đã đọc
          </Button>
          {canCreateNotifications && (
            <Button as={Link} to="/notifications/create">
              Tạo thông báo
            </Button>
          )}
        </div>
      </div>

      <FilterSection
        filters={{
          viewAll: canViewOthers ? "true" : viewAll,
          user_id,
          is_read,
          type,
          created_from,
          created_to,
        }}
        users={users}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={loadNotifications}
        canViewOthers={canViewOthers}
      />

      <Card>
        {isLoading ? (
          <Loader />
        ) : (
          <Table
            data={notifications}
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
                  handler: (notification) =>
                    navigate(`/notifications/${notification.id}`),
                },
                ...(isAdmin || isManager
                  ? [
                      {
                        icon: "mdi-pencil",
                        handler: (notification) =>
                          navigate(`/notifications/${notification.id}/edit`),
                        visible: () => true,
                      },
                    ]
                  : []),
                {
                  icon: "mdi-delete",
                  handler: handleDeleteNotification,
                  visible: () => true,
                },
              ],
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default NotificationList;
