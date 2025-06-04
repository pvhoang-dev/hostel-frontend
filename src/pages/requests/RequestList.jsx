import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { requestService } from "../../api/requests";
import { houseService } from "../../api/houses";
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
  requestTypes,
  requestStatuses,
  houses,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  hideHouseFilter = false,
  userRole,
}) => (
  <Card title="Bộ lọc" className="mb-3">
    <div className="row g-3">
      <div className="col-md-4">
        <Input
          label="Tìm kiếm"
          name="search"
          value={filters.search}
          onChange={onFilterChange}
          placeholder="Tìm kiếm..."
        />
      </div>

      <div className="col-md-4">
        <Select
          label="Loại yêu cầu"
          name="type"
          value={filters.type}
          onChange={onFilterChange}
          options={requestTypes}
        />
      </div>

      <div className="col-md-4">
        <Select
          label="Trạng thái"
          name="status"
          value={filters.status}
          onChange={onFilterChange}
          options={requestStatuses}
        />
      </div>

      {userRole === "manager" && !hideHouseFilter && houses.length > 0 && (
        <div className="col-md-4">
          <Select
            label="Nhà"
            name="house_id"
            value={filters.house_id}
            onChange={onFilterChange}
            options={[
              { value: "", label: "Tất cả nhà" },
              ...houses.map((house) => ({
                value: house.id,
                label: house.name,
              })),
            ]}
          />
        </div>
      )}
    </div>

    <div className="mt-3 d-flex justify-content-end">
      <Button variant="secondary" onClick={onClearFilters} className=" mr-2">
        Xóa bộ lọc
      </Button>
      <Button onClick={onApplyFilters}>Tìm</Button>
    </div>
  </Card>
);

const RequestList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();
  const { user, isAdmin, isManager, isTenant } = useAuth();

  // Get current filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 10;
  const sortBy = searchParams.get("sort_by") || "id";
  const sortDir = searchParams.get("sort_dir") || "desc";

  // Filter parameters
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const status = searchParams.get("status") || "";
  const house_id = searchParams.get("house_id") || "";

  // For manager - track managed houses
  const [managedHouses, setManagedHouses] = useState([]);
  const [loadingHouses, setLoadingHouses] = useState(false);

  // API hooks
  const {
    data: requestsData,
    loading: loadingRequests,
    execute: fetchRequests,
  } = useApi(requestService.getRequests);

  const { execute: deleteRequest } = useApi(requestService.deleteRequest);

  // Derived state
  const requests = requestsData?.data || [];
  const pagination = requestsData
    ? {
        current_page: requestsData.meta.current_page,
        last_page: requestsData.meta.last_page,
        total: requestsData.meta.total,
        per_page: requestsData.meta.per_page,
      }
    : null;

  const requestTypes = [
    { value: "", label: "Tất cả loại" },
    { value: "maintenance", label: "Bảo trì" },
    { value: "complaint", label: "Khiếu nại" },
    { value: "inquiry", label: "Yêu cầu thông tin" },
    { value: "other", label: "Khác" },
  ];

  const requestStatuses = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "pending", label: "Đang chờ" },
    { value: "completed", label: "Đã hoàn thành" },
  ];

  // Define table columns
  const columns = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "Loại yêu cầu",
      accessorKey: "request_type",
      cell: ({ row }) => getRequestTypeText(row.original.request_type),
    },
    {
      header: "Người gửi",
      accessorKey: "sender",
      cell: ({ row }) => (
        <div className="d-flex align-items-center">
          <div>
            <p className="m-0 fs-14">
              {row.original.sender ? (
                <a
                  href={`/users/${row.original.sender.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {row.original.sender.name}
                </a>
              ) : (
                "N/A"
              )}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Người nhận",
      accessorKey: "recipient",
      cell: ({ row }) => (
        <div className="d-flex align-items-center">
          <div>
            <p className="m-0 fs-14">
              {row.original.recipient ? (
                <a
                  href={`/users/${row.original.recipient.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {row.original.recipient.name}
                </a>
              ) : (
                "N/A"
              )}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      accessorKey: "status",
      cell: ({ row }) => (
        <span
          className={`badge text-white ${getStatusClass(row.original.status)}`}
        >
          {getStatusText(row.original.status)}
        </span>
      ),
    },
    {
      header: "Ngày tạo",
      accessorKey: "created_at",
      cell: ({ row }) => row.original.created_at,
    },
    {
      header: "Hành động",
      accessorKey: "actions",
    },
  ];

  useEffect(() => {
    if (user) {
      loadRequests();

      if (isManager) {
        fetchManagedHouses();
      }
    }
  }, [
    user,
    currentPage,
    perPage,
    sortBy,
    sortDir,
    type,
    status,
    search,
    house_id,
  ]);

  const loadRequests = async () => {
    const params = {
      page: currentPage,
      per_page: perPage,
      sort_by: sortBy,
      sort_dir: sortDir,
      include: "sender,recipient,room",
    };

    // Add filters if they exist
    if (search) params.search = search;
    if (type) params.type = type;
    if (status) params.status = status;

    // Handle role-specific filtering
    if (isTenant) {
      params.filter_user_id = user.id;
    } else if (isManager) {
      if (house_id) {
        params.house_id = house_id;
      } else if (managedHouses.length > 0) {
        // By default, use the first managed house
        params.house_id = managedHouses[0].id;
      }
    }

    const response = await fetchRequests(params);

    if (!response.success) {
      showError("Lỗi khi tải danh sách yêu cầu");
    }
  };

  const fetchManagedHouses = async () => {
    setLoadingHouses(true);
    try {
      const response = await houseService.getHouses({ manager_id: user.id });
      if (response.success) {
        setManagedHouses(response.data.data || []);
      }
    } catch (error) {
      showError("Đã xảy ra lỗi khi tải danh sách nhà được quản lý");
    } finally {
      setLoadingHouses(false);
    }
  };

  const handleDeleteRequest = async (request) => {
    if (!canDelete(request)) {
      showError("Bạn không có quyền xóa yêu cầu này");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa yêu cầu này?")) {
      const response = await deleteRequest(request.id);

      if (response.success) {
        showSuccess("Xóa yêu cầu thành công");
        loadRequests();
      } else {
        showError(response.message || "Có lỗi xảy ra khi xóa yêu cầu");
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
    const baseParams = {
      page: "1",
      per_page: perPage.toString(),
    };

    setSearchParams(baseParams);
  };

  // Helper functions
  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-warning";
      case "in_progress":
        return "bg-info";
      case "completed":
        return "bg-success";
      case "rejected":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Đang xử lý";
      case "completed":
        return "Đã hoàn thành";
      default:
        return "Không xác định";
    }
  };

  const getRequestTypeText = (type) => {
    switch (type) {
      case "maintenance":
        return "Bảo trì";
      case "complaint":
        return "Khiếu nại";
      case "inquiry":
        return "Yêu cầu thông tin";
      case "other":
        return "Khác";
      default:
        return "Không xác định";
    }
  };

  const canDelete = (request) => {
    if (isAdmin) return true;
    if (isManager && request.sender && request.sender.id === user.id)
      return true;
    if (
      isTenant &&
      request.sender &&
      request.sender.id === user.id &&
      request.status === "pending"
    )
      return true;
    return false;
  };

  const canEdit = (request) => {
    if (isAdmin) return true;
    if (
      isManager &&
      ((request.sender && request.sender.id === user.id) ||
        (request.recipient && request.recipient.id === user.id))
    )
      return true;
    if (
      isTenant &&
      request.sender &&
      request.sender.id === user.id &&
      request.status === "pending"
    )
      return true;
    return false;
  };

  const isLoading = loadingRequests || loadingHouses;

  // Nếu chưa có thông tin user, hiển thị loading
  if (!user) {
    return <Loader />;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3>Yêu cầu</h3>
        {(isAdmin || isManager || isTenant) && (
          <Button as={Link} to="/requests/create">
            Thêm yêu cầu
          </Button>
        )}
      </div>

      <FilterSection
        filters={{
          search,
          type,
          status,
          house_id,
        }}
        requestTypes={requestTypes}
        requestStatuses={requestStatuses}
        houses={managedHouses}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={loadRequests}
        userRole={user.role}
      />

      <Card>
        {isLoading ? (
          <Loader />
        ) : (
          <Table
            data={requests}
            columns={columns}
            pagination={pagination}
            onPageChange={handlePageChange}
            sortingState={[{ id: sortBy, desc: sortDir === "desc" }]}
            onSortingChange={handleSortingChange}
            loading={isLoading}
            actionColumn={{
              key: "actions",
              actions: isTenant ? [
                {
                  icon: "mdi-eye",
                  handler: (request) => navigate(`/requests/${request.id}`),
                },
              ] : [
                {
                  icon: "mdi-eye",
                  handler: (request) => navigate(`/requests/${request.id}`),
                },
                {
                  icon: "mdi-delete",
                  handler: handleDeleteRequest,
                },
              ],
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default RequestList;
