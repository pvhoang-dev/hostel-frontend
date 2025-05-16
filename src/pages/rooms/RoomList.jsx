import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { roomService } from "../../api/rooms";
import { houseService } from "../../api/houses";
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
  houses,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  hideHouseFilter = false,
}) => (
  <Card title="Bộ lọc" className="mb-3">
    <div className="row g-3">
      {!hideHouseFilter && (
        <div className="col-md-4">
          <Select
            label="Nhà"
            name="house_id"
            value={filters.house_id}
            onChange={onFilterChange}
            options={[
              { value: "", label: "Tất cả" },
              ...houses.map((house) => ({
                value: house.id.toString(),
                label: house.name,
              })),
            ]}
          />
        </div>
      )}

      <div className="col-md-4">
        <Input
          label="Số phòng"
          name="room_number"
          value={filters.room_number}
          onChange={onFilterChange}
        />
      </div>

      <div className="col-md-4">
        <Input
          label="Sức chứa"
          name="capacity"
          type="number"
          min="1"
          value={filters.capacity}
          onChange={onFilterChange}
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
            { value: "available", label: "Có sẵn" },
            { value: "occupied", label: "Đã thuê" },
            { value: "maintenance", label: "Bảo trì" },
            { value: "unavailable", label: "Không khả dụng" },
          ]}
        />
      </div>

      <div className="col-md-4">
        <Input
          label="Giá từ"
          name="min_price"
          type="number"
          min="0"
          value={filters.min_price}
          onChange={onFilterChange}
        />
      </div>

      <div className="col-md-4">
        <Input
          label="Giá đến"
          name="max_price"
          type="number"
          min="0"
          value={filters.max_price}
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

const RoomList = ({ houseId, embedded = false, fromHouseDetail = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();
  const { user, isAdmin, isManager, isTenant } = useAuth();

  // Get current filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 10;
  const sortBy = searchParams.get("sort_by") || "id";
  const sortDir = searchParams.get("sort_dir") || "asc";

  // If embedded and houseId is provided, use it as the filter
  const house_id = houseId || searchParams.get("house_id") || "";
  const room_number = searchParams.get("room_number") || "";
  const capacity = searchParams.get("capacity") || "";
  const status = searchParams.get("status") || "";
  const min_price = searchParams.get("min_price") || "";
  const max_price = searchParams.get("max_price") || "";

  // API hooks
  const {
    data: roomsData,
    loading: loadingRooms,
    execute: fetchRooms,
  } = useApi(roomService.getRooms);

  const {
    data: housesData,
    loading: loadingHouses,
    execute: fetchHouses,
  } = useApi(houseService.getHouses);

  const { execute: deleteRoom } = useApi(roomService.deleteRoom);

  // Derived state
  const rooms = roomsData?.data || [];
  const pagination = roomsData
    ? {
        current_page: roomsData.meta.current_page,
        last_page: roomsData.meta.last_page,
        total: roomsData.meta.total,
        per_page: roomsData.meta.per_page,
      }
    : null;

  const houses = housesData?.data || [];

  // Column definitions for the table - adjusted for embedded mode
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
    },
    // Don't show house name when embedded in house detail
    ...(!embedded
      ? [
          {
            accessorKey: "house.name",
            header: "Nhà",
            cell: ({ row }) => {
              return (
                <Link to={`/houses/${row.original.house?.id}`}>
                  {row.original.house?.name || "N/A"}
                </Link>
              );
            },
          },
        ]
      : []),
    {
      accessorKey: "room_number",
      header: "Số phòng",
    },
    {
      accessorKey: "capacity",
      header: "Sức chứa",
    },
    {
      accessorKey: "base_price",
      header: "Giá",
      cell: ({ row }) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(row.original.base_price),
    },
    {
      accessorKey: "status",
      header: "T.Thái",
      cell: ({ row }) => {
        const status = row.original.status;
        let statusText, statusColor;

        switch (status) {
          case "available":
            statusText = "Có sẵn";
            statusColor = "text-success";
            break;
          case "used":
            statusText = "Đã thuê";
            statusColor = "text-primary";
            break;
          case "maintain":
            statusText = "Bảo trì";
            statusColor = "text-warning";
            break;
          default:
            statusText = "Không khả dụng";
            statusColor = "text-danger";
        }

        return <span className={statusColor}>{statusText}</span>;
      },
    },
    // Only show created_at in standalone mode
    ...(!embedded
      ? [
          {
            accessorKey: "created_at",
            header: "Ngày tạo",
          },
        ]
      : []),
    {
      accessorKey: "actions",
      header: "Hành động",
    },
  ];

  useEffect(() => {
    if (user) {
      loadRooms();
      if (!embedded) {
        loadHouses();
      }
    }
  }, [user, houseId, embedded]);

  useEffect(() => {
    if (user && (!loadingHouses || embedded) && !loadingRooms) {
      loadRooms();
    }
  }, [currentPage, perPage, sortBy, sortDir, house_id, status, user, houseId]);

  const loadRooms = async () => {
    const params = {
      page: currentPage,
      per_page: perPage,
      sort_by: sortBy,
      sort_dir: sortDir,
      include: "house",
    };

    // When embedded, always use the provided houseId
    if (embedded && houseId) {
      params.house_id = houseId;
    } else {
      // Add filters if they exist
      if (house_id) params.house_id = house_id;
    }

    if (room_number) params.room_number = room_number;
    if (capacity) params.capacity = capacity;
    if (status) params.status = status;
    if (min_price) params.min_price = min_price;
    if (max_price) params.max_price = max_price;

    const response = await fetchRooms(params);

    if (!response.success) {
      showError("Lỗi khi tải danh sách phòng");
    }
  };

  const loadHouses = async () => {
    // For managers, only show their managed houses
    const params = isManager ? { manager_id: user.id } : {};
    await fetchHouses(params);
  };

  const handleDeleteRoom = async (room) => {
    // Only allow admins or the manager of this house to delete
    if (!(isAdmin || (isManager && room.house?.manager_id === user?.id))) {
      showError("Bạn không có quyền xóa phòng này");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa phòng này?")) {
      const response = await deleteRoom(room.id);

      if (response.success) {
        showSuccess("Xóa phòng thành công");
        loadRooms();
      } else {
        showError(response.message || "Có lỗi xảy ra khi xóa phòng");
      }
    }
  };

  // Custom handler for edit to check permissions
  const handleEditRoom = (room) => {
    // Only allow admins or the manager of this house to edit
    if (!(isAdmin || (isManager && room.house?.manager_id === user?.id))) {
      showError("Bạn không có quyền sửa phòng này");
      return;
    }

    // Navigate to edit page with appropriate state
    if (fromHouseDetail) {
      navigate(`/rooms/${room.id}/edit`, {
        state: {
          fromHouseDetail: true,
          houseId: houseId,
        },
      });
    } else {
      navigate(`/rooms/${room.id}/edit`);
    }
  };

  const handlePageChange = (page) => {
    if (embedded) {
      // When embedded, just reload with the new page
      const params = {
        page: page,
        per_page: perPage,
        house_id: houseId,
      };
      fetchRooms(params);
    } else {
      setSearchParams({
        ...Object.fromEntries(searchParams),
        page: page.toString(),
      });
    }
  };

  const handleSortingChange = (sorting) => {
    if (sorting.length > 0) {
      if (embedded) {
        // When embedded, just reload with the new sorting
        const params = {
          page: currentPage,
          per_page: perPage,
          sort_by: sorting[0].id,
          sort_dir: sorting[0].desc ? "desc" : "asc",
          house_id: houseId,
        };
        fetchRooms(params);
      } else {
        setSearchParams({
          ...Object.fromEntries(searchParams),
          sort_by: sorting[0].id,
          sort_dir: sorting[0].desc ? "desc" : "asc",
        });
      }
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
    if (embedded) {
      const params = {
        page: 1,
        per_page: perPage,
        house_id: houseId,
      };
      fetchRooms(params);
    } else {
      setSearchParams({
        page: "1",
        per_page: perPage.toString(),
      });
      loadRooms();
    }
  };

  const isLoading = loadingRooms || (loadingHouses && !embedded);

  // Nếu chưa có thông tin user, hiển thị loading
  if (!user) {
    return <Loader />;
  }

  return (
    <div className={embedded ? "" : "container-fluid"}>
      {!embedded && (
        <div className="d-flex justify-content-between align-items-center my-2">
          <h3>Phòng</h3>
          {(isAdmin || isManager) && (
            <Button
              as={Link}
              to={
                houseId ? `/rooms/create?house_id=${houseId}` : "/rooms/create"
              }
            >
              Thêm
            </Button>
          )}
        </div>
      )}

      {!embedded && !isTenant && (
        <FilterSection
          filters={{
            house_id,
            room_number,
            capacity,
            status,
            min_price,
            max_price,
          }}
          houses={houses}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          onApplyFilters={loadRooms}
          hideHouseFilter={!!houseId}
        />
      )}

      <Card className={embedded ? "border-0 p-0" : ""}>
        {embedded && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fs-5 fw-semibold mb-0">Phòng</h4>
            <Link
              to={`/rooms/create?house_id=${houseId}`}
              className="btn btn-sm btn-primary"
            >
              Thêm phòng
            </Link>
          </div>
        )}
        {isLoading ? (
          <Loader />
        ) : (
          <Table
            data={rooms}
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
                  handler: (room) => navigate(`/rooms/${room.id}`),
                },
                ...(isAdmin || isManager
                  ? [
                      {
                        icon: "mdi-pencil",
                        handler: handleEditRoom,
                      },
                      {
                        icon: "mdi-delete",
                        handler: handleDeleteRoom,
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

export default RoomList;
