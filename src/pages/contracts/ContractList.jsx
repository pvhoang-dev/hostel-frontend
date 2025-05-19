import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { contractService } from "../../api/contracts";
import { houseService } from "../../api/houses";
import { roomService } from "../../api/rooms";
import Table from "../../components/ui/Table";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Loader from "../../components/ui/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import DatePicker from "../../components/ui/DatePicker";
import { formatCurrency, formatDateWithoutTime } from "../../utils/formatters";

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
  return (
    <Card title="Bộ lọc" className="mb-3">
      <div className="row g-3">
        <div className="col-md-4">
          <Select
            label="Nhà"
            name="house_id"
            value={filters.house_id}
            onChange={(e) => {
              onFilterChange(e);
            }}
            options={[
              { value: "", label: "Tất cả" },
              ...houses.map((house) => ({
                value: house.id.toString(),
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
                value: room.id.toString(),
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
          className=" mr-2"
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
  const { user, isAdmin, isManager, isTenant } = useAuth();
  const navigate = useNavigate();

  // State cho rooms và houses
  const [filteredRooms, setFilteredRooms] = useState([]);

  // Get current filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 10;
  const sortBy = searchParams.get("sort_by") || "id";
  const sortDir = searchParams.get("sort_dir") || "asc";

  // Lấy các filters từ URL
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
      cell: ({ row }) => {
        return (
          <Link to={`/houses/${row.original.room?.house?.id}`}>
            {row.original.room?.house?.name || "N/A"}
          </Link>
        );
      },
    },
    {
      accessorKey: "room.room_number",
      header: "Phòng",
      cell: ({ row }) => {
        return (
          <Link to={`/rooms/${row.original.room?.id}`}>
            {row.original.room?.room_number || "N/A"}
          </Link>
        );
      },
    },
    {
      accessorKey: "start_date",
      header: "Ngày bắt đầu",
      cell: ({ row }) => formatDateWithoutTime(row.original.start_date),
    },
    {
      accessorKey: "end_date",
      header: "Ngày kết thúc",
      cell: ({ row }) => formatDateWithoutTime(row.original.end_date),
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

  // Tải dữ liệu ban đầu
  useEffect(() => {
    // Tải danh sách nhà
    const loadHouses = async () => {
      // For managers, only show their managed houses
      const params = isManager ? { manager_id: user?.id } : {};
      await fetchHouses(params);
    };

    // Tải contracts ban đầu và houses
    if (user) {
      loadHouses();
      // Nếu có house_id trong URL, tải rooms cho house đó
      if (house_id) {
        loadRoomsByHouse(house_id);
      }
      // Tải contracts với các filters từ URL
      loadContracts();
    }
  }, [user]);

  // Tải lại contracts khi các filters thay đổi
  useEffect(() => {
    if (user) {
      loadContracts();
    }
  }, [currentPage, perPage, sortBy, sortDir, house_id, room_id, status]);

  // Tải phòng khi house_id thay đổi
  useEffect(() => {
    if (house_id) {
      loadRoomsByHouse(house_id);
    } else {
      // Nếu không có house_id, reset room_id và danh sách phòng
      setFilteredRooms([]);
      if (room_id) {
        // Xóa room_id nếu house_id không còn
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.delete("room_id");
          return newParams;
        });
      }
    }
  }, [house_id]);

  // Hàm tải contracts
  const loadContracts = async () => {
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        sort_by: sortBy,
        sort_dir: sortDir,
        include: "room.house,tenant",
      };

      // Thêm các filters nếu có
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
    } catch (error) {
      console.error("Error loading contracts:", error);
      showError("Đã xảy ra lỗi khi tải danh sách hợp đồng");
    }
  };

  // Hàm tải rooms theo house
  const loadRoomsByHouse = async (houseId) => {
    if (!houseId) return;

    try {
      const response = await fetchRooms({ house_id: houseId });
      
      if (response.success) {
        setFilteredRooms(response.data.data || []);
      } else {
        showError("Lỗi khi tải danh sách phòng");
        setFilteredRooms([]);
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
      showError("Đã xảy ra lỗi khi tải danh sách phòng");
      setFilteredRooms([]);
    }
  };

  // Xử lý xóa contract
  const handleDeleteContract = async (contract) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hợp đồng này không?")) {
      try {
        const response = await deleteContract(contract.id);
        if (response.success) {
          showSuccess("Xóa hợp đồng thành công");
          loadContracts();
        } else {
          showError(response.message || "Không thể xóa hợp đồng");
        }
      } catch (error) {
        console.error("Error deleting contract:", error);
        showError("Đã xảy ra lỗi khi xóa hợp đồng");
      }
    }
  };

  // Xử lý chuyển trang
  const handlePageChange = (page) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", page.toString());
      return newParams;
    });
  };

  // Xử lý thay đổi sắp xếp
  const handleSortingChange = (sorting) => {
    if (sorting.length > 0) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set("sort_by", sorting[0].id);
        newParams.set("sort_dir", sorting[0].desc ? "desc" : "asc");
        return newParams;
      });
    }
  };

  // Xử lý thay đổi filter
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      
      if (value) {
        newParams.set(name, value);
      } else {
        newParams.delete(name);
      }
      
      // Reset về trang 1 khi filter thay đổi
      newParams.set("page", "1");
      
      return newParams;
    });
  };

  // Xử lý xóa tất cả filter
  const clearFilters = () => {
    // Giữ lại per_page và đặt page về 1
    setSearchParams({
      page: "1",
      per_page: perPage.toString(),
    });
  };

  const applyFilters = () => {
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

      {!isTenant && (
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
          rooms={filteredRooms.length > 0 ? filteredRooms : rooms}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          onApplyFilters={applyFilters}
        />
      )}

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
