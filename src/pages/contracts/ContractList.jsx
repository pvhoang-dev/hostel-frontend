import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { contractService } from "../../api/contracts";
import { houseService } from "../../api/houses";
import { roomService } from "../../api/rooms";
import Table from "../../components/common/Table";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import DatePicker from "../../components/common/DatePicker";
import { formatDate, formatCurrency } from "../../utils/formatters";

// Component con hiển thị phần filter
const FilterSection = ({
  filters,
  houses,
  rooms,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  onHouseChange,
}) => {
  const handleHouseChange = (e) => {
    const { value } = e.target;
    onHouseChange(value);
    onFilterChange(e);
  };

  return (
    <Card title="Bộ lọc" className="mb-3">
      <div className="row g-3">
        <div className="col-md-4">
          <Select
            label="Nhà"
            name="house_id"
            value={filters.house_id}
            onChange={handleHouseChange}
            options={[
              { value: "", label: "Tất cả" },
              ...houses.map((house) => ({
                value: house.id,
                label: house.name,
              })),
            ]}
          />
        </div>

        <div className="col-md-4">
          <Select
            label="Phòng"
            name="room_id"
            value={filters.room_id}
            onChange={onFilterChange}
            options={[
              { value: "", label: "Tất cả" },
              ...rooms.map((room) => ({
                value: room.id,
                label: `Phòng ${room.room_number}`,
              })),
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
              { value: "active", label: "Đang hoạt động" },
              { value: "pending", label: "Chờ duyệt" },
              { value: "terminated", label: "Đã chấm dứt" },
              { value: "expired", label: "Đã hết hạn" },
            ]}
          />
        </div>

        <div className="col-md-4">
          <DatePicker
            label="Ngày bắt đầu từ"
            name="start_date_from"
            value={filters.start_date_from}
            onChange={onFilterChange}
          />
        </div>

        <div className="col-md-4">
          <DatePicker
            label="Ngày bắt đầu đến"
            name="start_date_to"
            value={filters.start_date_to}
            onChange={onFilterChange}
          />
        </div>

        <div className="col-md-4">
          <DatePicker
            label="Ngày kết thúc từ"
            name="end_date_from"
            value={filters.end_date_from}
            onChange={onFilterChange}
          />
        </div>

        <div className="col-md-4">
          <DatePicker
            label="Ngày kết thúc đến"
            name="end_date_to"
            value={filters.end_date_to}
            onChange={onFilterChange}
          />
        </div>

        <div className="col-md-4">
          <Input
            label="Giá từ"
            name="min_rent"
            type="number"
            min="0"
            value={filters.min_rent}
            onChange={onFilterChange}
          />
        </div>

        <div className="col-md-4">
          <Input
            label="Giá đến"
            name="max_rent"
            type="number"
            min="0"
            value={filters.max_rent}
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
};

const ContractList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const { user, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

  // Get current filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 5;
  const sortBy = searchParams.get("sort_by") || "id";
  const sortDir = searchParams.get("sort_dir") || "asc";

  const house_id = searchParams.get("house_id") || "";
  const room_id = searchParams.get("room_id") || "";
  const status = searchParams.get("status") || "";
  const start_date_from = searchParams.get("start_date_from") || "";
  const start_date_to = searchParams.get("start_date_to") || "";
  const end_date_from = searchParams.get("end_date_from") || "";
  const end_date_to = searchParams.get("end_date_to") || "";
  const min_rent = searchParams.get("min_rent") || "";
  const max_rent = searchParams.get("max_rent") || "";

  // API hooks
  const {
    data: contractsData,
    loading: loadingContracts,
    execute: fetchContracts,
  } = useApi(contractService.getContracts);

  const {
    data: housesData,
    loading: loadingHouses,
    execute: fetchHouses,
  } = useApi(houseService.getHouses);

  const {
    data: roomsData,
    loading: loadingRooms,
    execute: fetchRooms,
  } = useApi(roomService.getRooms);

  const { execute: deleteContract } = useApi(contractService.deleteContract);

  // Derived state
  const contracts = contractsData?.data || [];
  const pagination = contractsData
    ? {
        current_page: contractsData.meta.current_page,
        last_page: contractsData.meta.last_page,
        total: contractsData.meta.total,
        per_page: contractsData.meta.per_page,
      }
    : null;

  const houses = housesData?.data || [];
  const rooms = roomsData?.data || [];

  // Column definitions for the table
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "room.house.name",
      header: "Nhà",
      cell: ({ row }) => row.original.room?.house?.name || "N/A",
    },
    {
      accessorKey: "room.room_number",
      header: "Phòng",
      cell: ({ row }) => row.original.room?.room_number || "N/A",
    },
    {
      accessorKey: "tenant.name",
      header: "Người thuê",
      cell: ({ row }) => row.original.tenant?.name || "N/A",
    },
    {
      accessorKey: "start_date",
      header: "Ngày bắt đầu",
      cell: ({ row }) => formatDate(row.original.start_date),
    },
    {
      accessorKey: "end_date",
      header: "Ngày kết thúc",
      cell: ({ row }) => formatDate(row.original.end_date),
    },
    {
      accessorKey: "monthly_price",
      header: "Tiền thuê",
      cell: ({ row }) => formatCurrency(row.original.monthly_price),
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
            return <span className={statusClass}>Đang hoạt động</span>;
          case "pending":
            statusClass = "text-warning";
            return <span className={statusClass}>Chờ duyệt</span>;
          case "terminated":
            statusClass = "text-danger";
            return <span className={statusClass}>Đã chấm dứt</span>;
          case "expired":
            statusClass = "text-secondary";
            return <span className={statusClass}>Đã hết hạn</span>;
          default:
            statusClass = "text-secondary";
            return <span className={statusClass}>{status}</span>;
        }
      },
    },
    {
      accessorKey: "actions",
      header: "Hành động",
    },
  ];

  useEffect(() => {
    loadContracts();
    loadHouses();
  }, []);

  useEffect(() => {
    if (user && !loadingHouses && !loadingContracts) {
      loadContracts();
    }
  }, [currentPage, perPage, sortBy, sortDir, house_id, room_id, status, user]);

  useEffect(() => {
    if (house_id) {
      loadRoomsByHouse(house_id);
    } else {
      // If no house selected, clear rooms
      setSearchParams((prev) => {
        const newParams = { ...Object.fromEntries(prev) };
        newParams.room_id = "";
        return newParams;
      });
    }
  }, [house_id]);

  const loadContracts = async () => {
    const params = {
      page: currentPage,
      per_page: perPage,
      sort_by: sortBy,
      sort_dir: sortDir,
      include: "room.house,tenant",
    };

    // Add filters if they exist
    if (house_id) params.house_id = house_id;
    if (room_id) params.room_id = room_id;
    if (status) params.status = status;
    if (start_date_from) params.start_date_from = start_date_from;
    if (start_date_to) params.start_date_to = start_date_to;
    if (end_date_from) params.end_date_from = end_date_from;
    if (end_date_to) params.end_date_to = end_date_to;
    if (min_rent) params.min_rent = min_rent;
    if (max_rent) params.max_rent = max_rent;

    const response = await fetchContracts(params);

    if (!response.success) {
      showError("Lỗi khi tải danh sách hợp đồng");
    }
  };

  const loadHouses = async () => {
    // For managers, only show their managed houses
    const params = isManager ? { manager_id: user.id } : {};
    await fetchHouses(params);
  };

  const loadRoomsByHouse = async (houseId) => {
    if (!houseId) return;

    const response = await fetchRooms({ house_id: houseId });
    if (!response.success) {
      showError("Lỗi khi tải danh sách phòng");
    }
  };

  const handleDeleteContract = async (contract) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hợp đồng này không?")) {
      const response = await deleteContract(contract.id);
      if (response.success) {
        showSuccess("Xóa hợp đồng thành công");
        loadContracts();
      } else {
        showError(response.message || "Không thể xóa hợp đồng");
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

  const handleHouseChange = (houseId) => {
    // When house changes, we need to load rooms for that house
    loadRoomsByHouse(houseId);
  };

  const clearFilters = () => {
    setSearchParams({
      page: "1",
      per_page: perPage.toString(),
    });
    loadContracts();
  };

  const isLoading = loadingContracts || loadingHouses || loadingRooms;

  // Nếu chưa có thông tin user, hiển thị loading
  if (!user) {
    return <Loader />;
  }

  const canManageContracts = ["admin", "manager"].includes(user.role);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3>Hợp đồng</h3>
        {canManageContracts && (
          <Button as={Link} to="/contracts/create">
            Thêm
          </Button>
        )}
      </div>

      <FilterSection
        filters={{
          house_id,
          room_id,
          status,
          start_date_from,
          start_date_to,
          end_date_from,
          end_date_to,
          min_rent,
          max_rent,
        }}
        houses={houses}
        rooms={rooms}
        onFilterChange={handleFilterChange}
        onHouseChange={handleHouseChange}
        onClearFilters={clearFilters}
        onApplyFilters={loadContracts}
      />

      <Card>
        {isLoading ? (
          <Loader />
        ) : (
          <Table
            data={contracts}
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
                  handler: (contract) => navigate(`/contracts/${contract.id}`),
                },
                ...(isAdmin ||
                (isManager &&
                  contracts.some((c) => c.room?.house?.manager_id === user?.id))
                  ? [
                      {
                        icon: "mdi-pencil",
                        handler: (contract) => {
                          // Check if user is manager of this house
                          const canManage =
                            isAdmin ||
                            (isManager &&
                              contract.room?.house?.manager_id === user?.id);

                          if (canManage) {
                            navigate(`/contracts/${contract.id}/edit`);
                          }
                        },
                      },
                      {
                        icon: "mdi-delete",
                        handler: (contract) => {
                          // Check if user is manager of this house
                          const canManage =
                            isAdmin ||
                            (isManager &&
                              contract.room?.house?.manager_id === user?.id);

                          if (canManage) {
                            handleDeleteContract(contract);
                          }
                        },
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

export default ContractList;
