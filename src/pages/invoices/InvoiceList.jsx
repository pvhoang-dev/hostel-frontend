import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { invoiceService } from "../../api/invoices";
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
import { formatCurrency } from "../../utils/formatters";

// Filter component for invoices
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
            label="Loại hóa đơn"
            name="invoice_type"
            value={filters.invoice_type}
            onChange={onFilterChange}
            options={[
              { value: "", label: "Tất cả" },
              { value: "custom", label: "Tùy chỉnh" },
              { value: "service_usage", label: "Sử dụng dịch vụ" },
            ]}
          />
        </div>

        <div className="col-md-3">
          <Input
            label="Tháng"
            name="month"
            type="number"
            min="1"
            max="12"
            value={filters.month}
            onChange={onFilterChange}
          />
        </div>

        <div className="col-md-3">
          <Input
            label="Năm"
            name="year"
            type="number"
            min="2000"
            value={filters.year}
            onChange={onFilterChange}
          />
        </div>

        <div className="col-md-3">
          <Input
            label="Số tiền từ"
            name="min_amount"
            type="number"
            min="0"
            value={filters.min_amount}
            onChange={onFilterChange}
          />
        </div>

        <div className="col-md-3">
          <Input
            label="Số tiền đến"
            name="max_amount"
            type="number"
            min="0"
            value={filters.max_amount}
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

const InvoiceList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const { user, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

  // Get current filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 5;
  const sortBy = searchParams.get("sort_by") || "created_at";
  const sortDir = searchParams.get("sort_dir") || "desc";

  const house_id = searchParams.get("house_id") || "";
  const room_id = searchParams.get("room_id") || "";
  const invoice_type = searchParams.get("invoice_type") || "";
  const month = searchParams.get("month") || "";
  const year = searchParams.get("year") || "";
  const min_amount = searchParams.get("min_amount") || "";
  const max_amount = searchParams.get("max_amount") || "";

  // API hooks
  const {
    data: invoicesData,
    loading: loadingInvoices,
    execute: fetchInvoices,
  } = useApi(invoiceService.getInvoices);

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

  const { execute: deleteInvoice } = useApi(invoiceService.deleteInvoice);

  // Derived state
  const invoices = invoicesData?.data || [];
  const pagination = invoicesData
    ? {
        current_page: invoicesData.meta.current_page,
        last_page: invoicesData.meta.last_page,
        total: invoicesData.meta.total,
        per_page: invoicesData.meta.per_page,
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
      accessorKey: "month",
      header: "Tháng/Năm",
      cell: ({ row }) => `${row.original.month}/${row.original.year}`,
    },
    {
      accessorKey: "invoice_type",
      header: "Loại",
      cell: ({ row }) =>
        row.original.invoice_type === "custom"
          ? "Tùy chỉnh"
          : "Sử dụng dịch vụ",
    },
    {
      accessorKey: "total_amount",
      header: "Tổng tiền",
      cell: ({ row }) => formatCurrency(row.original.total_amount),
    },
    {
      accessorKey: "created_at",
      header: "Ngày tạo",
      cell: ({ row }) => row.original.created_at,
    },
    {
      accessorKey: "actions",
      header: "Hành động",
    },
  ];

  useEffect(() => {
    loadHouses();
  }, []);

  useEffect(() => {
    if (user) {
      loadInvoices();
    }
  }, [
    currentPage,
    perPage,
    sortBy,
    sortDir,
    house_id,
    room_id,
    invoice_type,
    user,
  ]);

  useEffect(() => {
    if (house_id) {
      loadRoomsByHouse(house_id);
    } else {
      setSearchParams((prev) => {
        const newParams = { ...Object.fromEntries(prev) };
        newParams.room_id = "";
        return newParams;
      });
    }
  }, [house_id]);

  const loadInvoices = async () => {
    const params = {
      page: currentPage,
      per_page: perPage,
      sort_by: sortBy,
      sort_dir: sortDir,
      include: "room.house,items,creator",
    };

    // Add filters if they exist
    if (house_id) params.house_id = house_id;
    if (room_id) params.room_id = room_id;
    if (invoice_type) params.invoice_type = invoice_type;
    if (month) params.month = month;
    if (year) params.year = year;
    if (min_amount) params.min_amount = min_amount;
    if (max_amount) params.max_amount = max_amount;

    const response = await fetchInvoices(params);

    if (!response.success) {
      showError("Lỗi khi tải danh sách hóa đơn");
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

  const handleDeleteInvoice = async (invoice) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này không?")) {
      const response = await deleteInvoice(invoice.id);
      if (response.success) {
        showSuccess("Xóa hóa đơn thành công");
        loadInvoices();
      } else {
        showError(response.message || "Không thể xóa hóa đơn");
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
    loadInvoices();
  };

  const isLoading = loadingInvoices || loadingHouses || loadingRooms;

  // Nếu chưa có thông tin user, hiển thị loading
  if (!user) {
    return <Loader />;
  }

  const canManageInvoices = isAdmin || isManager;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3>Hóa đơn</h3>
        {canManageInvoices && (
          <Button as={Link} to="/invoices/create">
            Thêm
          </Button>
        )}
      </div>

      <FilterSection
        filters={{
          house_id,
          room_id,
          invoice_type,
          month,
          year,
          min_amount,
          max_amount,
        }}
        houses={houses}
        rooms={rooms}
        onFilterChange={handleFilterChange}
        onHouseChange={handleHouseChange}
        onClearFilters={clearFilters}
        onApplyFilters={loadInvoices}
      />

      <Card>
        {isLoading ? (
          <Loader />
        ) : (
          <Table
            data={invoices}
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
                  handler: (invoice) => navigate(`/invoices/${invoice.id}`),
                },
                ...(canManageInvoices
                  ? [
                      {
                        icon: "mdi-pencil",
                        handler: (invoice) => {
                          // Check if user is manager of this house or admin
                          const canManage =
                            isAdmin ||
                            (isManager &&
                              invoice.room?.house?.manager_id === user?.id);

                          if (canManage) {
                            navigate(`/invoices/${invoice.id}/edit`);
                          }
                        },
                        isDisabled: (invoice) =>
                          isManager &&
                          invoice.room?.house?.manager_id !== user?.id,
                      },
                      {
                        icon: "mdi-delete",
                        handler: (invoice) => {
                          // Check if user is manager of this house or admin
                          const canManage =
                            isAdmin ||
                            (isManager &&
                              invoice.room?.house?.manager_id === user?.id);

                          if (canManage) {
                            handleDeleteInvoice(invoice);
                          }
                        },
                        isDisabled: (invoice) =>
                          (isManager &&
                            invoice.room?.house?.manager_id !== user?.id) ||
                          (invoice.transactions &&
                            invoice.transactions.length > 0),
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

export default InvoiceList;
